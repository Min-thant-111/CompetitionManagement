import { useState } from "react";
import { Send, CheckCircle2, MessageSquare, Phone } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// Admin contact info
const ADMIN_PHONE = "+1 (555) 123-4567";

export default function ContactUs() {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!subject.trim()) {
      toast.error("Please enter a subject");
      return;
    }
    if (!message.trim()) {
      toast.error("Please enter your message");
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast.success("Message sent successfully!");
    setSubmitted(true);
    setIsSubmitting(false);
  };

  const handleSendAnother = () => {
    setSubject("");
    setMessage("");
    setSubmitted(false);
  };

  return (
    <AppLayout role="student">
      <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-2xl lg:text-3xl font-display font-bold text-foreground">
            Contact Us
          </h1>
          <p className="text-muted-foreground mt-1">
            Have questions or need help? Send us a message
          </p>
        </div>

        {submitted ? (
          <div className="card-static p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-success" />
            </div>
            <h2 className="text-xl font-display font-semibold text-foreground mb-2">
              Message Sent!
            </h2>
            <p className="text-muted-foreground mb-6">
              Thank you for reaching out. Our admin team will review your message and get back to you soon.
            </p>
            <Button onClick={handleSendAnother} variant="outline">
              Send Another Message
            </Button>
          </div>
        ) : (
          <div className="card-static p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-secondary" />
              </div>
              <div>
                <h2 className="font-semibold text-foreground">Send a Message</h2>
                <p className="text-sm text-muted-foreground">We'll respond as soon as possible</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">
                  Subject <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  placeholder="What is your message about?"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg bg-muted/50 border border-border text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              {/* Admin Phone Info */}
              <div className="p-4 rounded-lg bg-info/5 border border-info/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-info/10 flex items-center justify-center">
                    <Phone className="w-5 h-5 text-info" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Admin Contact Number</p>
                    <p className="font-medium text-foreground">{ADMIN_PHONE}</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  For urgent matters, you can reach us directly at this number.
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">
                  Message <span className="text-destructive">*</span>
                </label>
                <textarea
                  placeholder="Type your message here..."
                  rows={6}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-muted/50 border border-border text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                />
              </div>

              <Button 
                type="submit" 
                className="w-full gap-2"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Send Message
                  </>
                )}
              </Button>
            </form>
          </div>
        )}

        {/* FAQ Preview */}
        <div className="card-static p-6">
          <h3 className="font-semibold text-foreground mb-4">Frequently Asked Questions</h3>
          <div className="space-y-3">
            {[
              { q: "How do I join a team?", a: "Go to the Competitions page, select a competition, and click 'Join Existing Team'" },
              { q: "Can I leave a team after joining?", a: "Yes, go to My Teams and click the 'Leave Team' button" },
              { q: "How do I submit for external competitions?", a: "Once admin enables submissions, go to Submissions → External tab" },
            ].map((faq, index) => (
              <div key={index} className="p-3 rounded-lg bg-muted/30 border border-border">
                <p className="font-medium text-sm text-foreground">{faq.q}</p>
                <p className="text-sm text-muted-foreground mt-1">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
