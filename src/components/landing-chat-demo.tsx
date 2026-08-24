import { Send } from "lucide-react";

export function LandingChatDemo() {
  return (
    <div className="hero-device-stage" aria-hidden="true">
      <div className="hero-glow" />
      <div className="desktop-chat-demo">
        <div className="browser-bar">
          <span className="browser-dot" />
          <span className="browser-dot" />
          <span className="browser-dot" />
          <div className="browser-address">contactme.jrssoftware.com/john</div>
        </div>
        <div className="demo-chat-header">
          <div className="demo-avatar">JD</div>
          <div><strong>John Doe</strong><small><i /> Online</small></div>
        </div>
        <div className="demo-messages">
          <div className="demo-bubble demo-bubble--them">Hey! I&apos;d like to know more about your product.<small>10:30 AM</small></div>
          <div className="demo-bubble demo-bubble--me">Hi there! Sure, I&apos;d be happy to help you.<small>10:31 AM ✓✓</small></div>
          <div className="demo-bubble demo-bubble--them">Awesome! Can we schedule a quick call?<small>10:32 AM</small></div>
          <div className="demo-bubble demo-bubble--me">Of course! How about tomorrow at 10am?<small>10:32 AM ✓✓</small></div>
        </div>
        <div className="demo-composer"><span>Type a message...</span><Send size={18} /></div>
      </div>
      <div className="mobile-chat-demo">
        <div className="mobile-browser">contactme.jrssoftware.com/john</div>
        <div className="demo-chat-header demo-chat-header--mobile">
          <div className="demo-avatar demo-avatar--small">JD</div>
          <div><strong>John Doe</strong><small><i /> Online</small></div>
        </div>
        <div className="demo-messages demo-messages--mobile">
          <div className="demo-bubble demo-bubble--them">Hey! I&apos;d like to know more about your product.</div>
          <div className="demo-bubble demo-bubble--me">Sure, happy to help you.</div>
          <div className="demo-bubble demo-bubble--them">Can we schedule a call?</div>
        </div>
        <div className="demo-composer demo-composer--mobile"><span>Message...</span><Send size={15} /></div>
      </div>
    </div>
  );
}
