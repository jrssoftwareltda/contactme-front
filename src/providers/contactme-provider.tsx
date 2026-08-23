"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import { Client, type IMessage, type StompSubscription } from "@stomp/stompjs";
import { contactMeRequest, contactMeWsUrl, type TokenGetter } from "@/lib/api";
import type { ProfileResponse } from "@/lib/backend-types";
import { bootstrapLocalDevice, type LocalDevice } from "@/lib/e2ee";

type ContactMeContextValue = {
  profile: ProfileResponse | null;
  device: LocalDevice | null;
  loading: boolean;
  error: string;
  realtimeConnected: boolean;
  getToken: TokenGetter;
  request: <T>(path: string, init?: RequestInit) => Promise<T>;
  refreshProfile: () => Promise<ProfileResponse>;
  updateProfile: (payload: Partial<Pick<ProfileResponse, "username" | "displayName" | "avatarUrl" | "status">>) => Promise<ProfileResponse>;
  subscribe: (destination: string, handler: (message: IMessage) => void) => StompSubscription | null;
  publish: (destination: string, payload: unknown) => boolean;
};

const ContactMeContext = createContext<ContactMeContextValue | null>(null);

export function ContactMeProvider({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn, getToken: clerkGetToken } = useAuth();
  const { user } = useUser();
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [device, setDevice] = useState<LocalDevice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [realtimeConnected, setRealtimeConnected] = useState(false);
  const clientRef = useRef<Client | null>(null);

  const getToken = useCallback<TokenGetter>(() => clerkGetToken(), [clerkGetToken]);
  const request = useCallback(<T,>(path: string, init?: RequestInit) => contactMeRequest<T>(getToken, path, init), [getToken]);

  const refreshProfile = useCallback(async () => {
    const loaded = await request<ProfileResponse>("/profile");
    setProfile(loaded);
    return loaded;
  }, [request]);

  const updateProfile = useCallback(async (payload: Partial<Pick<ProfileResponse, "username" | "displayName" | "avatarUrl" | "status">>) => {
    const updated = await request<ProfileResponse>("/profile", { method: "PUT", body: JSON.stringify(payload) });
    setProfile(updated);
    return updated;
  }, [request]);

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      setProfile(null);
      setDevice(null);
      setLoading(false);
      setError("");
      return;
    }

    let active = true;
    setLoading(true);
    setError("");
    void (async () => {
      try {
        let loadedProfile = await request<ProfileResponse>("/profile");
        const clerkName = user?.fullName || user?.firstName || null;
        const clerkAvatar = user?.imageUrl || null;
        if ((!loadedProfile.displayName && clerkName) || (!loadedProfile.avatarUrl && clerkAvatar)) {
          loadedProfile = await request<ProfileResponse>("/profile", {
            method: "PUT",
            body: JSON.stringify({
              displayName: loadedProfile.displayName || clerkName,
              avatarUrl: loadedProfile.avatarUrl || clerkAvatar,
            }),
          });
        }
        const localDevice = await bootstrapLocalDevice(getToken);
        if (active) {
          setProfile(loadedProfile);
          setDevice(localDevice);
        }
      } catch (cause) {
        if (active) setError(cause instanceof Error ? cause.message : "Unable to connect to Contact Me backend.");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [getToken, isLoaded, isSignedIn, request, user?.firstName, user?.fullName, user?.imageUrl]);

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    const client = new Client({
      brokerURL: contactMeWsUrl,
      reconnectDelay: 3000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      beforeConnect: async () => {
        const token = await getToken();
        client.connectHeaders = token ? { Authorization: `Bearer ${token}` } : {};
      },
      onConnect: () => setRealtimeConnected(true),
      onDisconnect: () => setRealtimeConnected(false),
      onWebSocketClose: () => setRealtimeConnected(false),
      onStompError: () => setRealtimeConnected(false),
      debug: () => undefined,
    });
    clientRef.current = client;
    client.activate();
    return () => {
      clientRef.current = null;
      setRealtimeConnected(false);
      void client.deactivate();
    };
  }, [getToken, isLoaded, isSignedIn]);

  const subscribe = useCallback((destination: string, handler: (message: IMessage) => void) => {
    const client = clientRef.current;
    if (!client?.connected) return null;
    return client.subscribe(destination, handler);
  }, []);

  const publish = useCallback((destination: string, payload: unknown) => {
    const client = clientRef.current;
    if (!client?.connected) return false;
    client.publish({ destination, body: JSON.stringify(payload) });
    return true;
  }, []);

  const value = useMemo<ContactMeContextValue>(() => ({
    profile,
    device,
    loading,
    error,
    realtimeConnected,
    getToken,
    request,
    refreshProfile,
    updateProfile,
    subscribe,
    publish,
  }), [device, error, getToken, loading, profile, publish, realtimeConnected, refreshProfile, request, subscribe, updateProfile]);

  return <ContactMeContext.Provider value={value}>{children}</ContactMeContext.Provider>;
}

export function useContactMe() {
  const context = useContext(ContactMeContext);
  if (!context) throw new Error("useContactMe must be used inside ContactMeProvider.");
  return context;
}
