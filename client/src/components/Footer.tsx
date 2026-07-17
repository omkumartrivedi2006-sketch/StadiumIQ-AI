import { Link } from "wouter";
import { Github, Linkedin, Twitter, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border py-12 px-4 md:px-0 bg-background transition-colors duration-200">
      <div className="container mx-auto">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div className="space-y-4">
            <h4 className="font-bold text-foreground text-lg">StadiumIQ AI</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Intelligent stadium assistance and analytics for FIFA World Cup 2026. Enabling safer, smarter, and more comfortable experiences.
            </p>
            <div className="flex items-center gap-4 text-muted-foreground">
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors" title="GitHub">
                <Github size={20} />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors" title="LinkedIn">
                <Linkedin size={20} />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors" title="Twitter">
                <Twitter size={20} />
              </a>
              <a href="mailto:support@stadiumiq.com" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors" title="Email">
                <Mail size={20} />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold text-foreground mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/about">
                  <a className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">About Us</a>
                </Link>
              </li>
              <li>
                <Link href="/features">
                  <a className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Features</a>
                </Link>
              </li>
              <li>
                <Link href="/pricing">
                  <a className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Pricing</a>
                </Link>
              </li>
              <li>
                <Link href="/blog">
                  <a className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Blog</a>
                </Link>
              </li>
              <li>
                <Link href="/contact">
                  <a className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Contact</a>
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-foreground mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/privacy">
                  <a className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Privacy Policy</a>
                </Link>
              </li>
              <li>
                <Link href="/terms">
                  <a className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Terms & Conditions</a>
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-foreground mb-4">Resources</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="/features#docs" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Documentation</a>
              </li>
              <li>
                <Link href="/contact">
                  <a className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Help Center</a>
                </Link>
              </li>
              <li>
                <Link href="/contact#faq">
                  <a className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">FAQ</a>
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-border pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; 2026 StadiumIQ AI. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
