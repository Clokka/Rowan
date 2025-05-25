import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, Phone, MapPin } from "lucide-react";
import { motion } from "framer-motion";
import "../styles/index.css"; // Make sure this path matches your structure

export default function ClokkaWebsite() {
  return (
    <main className="clokka-main">
      {/* Hero Section */}
      <section className="hero">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="hero-title"
        >
          Clokka
        </motion.h1>
        <p className="hero-subtitle">
          Streetwear watches curated for your vibe. Discover affordable timepieces with drip.
        </p>
        <Button className="cta-button">Shop on Amazon</Button>
      </section>

      {/* Shop Section */}
      <section className="section shop-section">
        <h2 className="section-title">Our Picks</h2>
        <div className="product-grid">
          {["/mnt/data/Clokka 1.jpg", "/mnt/data/Clokka 2.jpg", "/mnt/data/Clokka 3.jpg"].map((src, index) => (
            <Card key={index} className="product-card">
              <CardContent className="product-card-content">
                <img src={src} alt={`Clokka Watch ${index + 1}`} className="product-image" />
                <h3 className="product-title">Clokka Watch {index + 1}</h3>
                <p className="product-description">Sleek. Bold. Affordable.</p>
                <Button className="view-button">View on Amazon</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* About Section */}
      <section className="section about-section">
        <h2 className="section-title">About Clokka</h2>
        <p className="section-text">
          Clokka is a streetwear-inspired watch reselling brand. We handpick sleek, affordable watches that add style without breaking the bank. Linked directly to Amazon, our shop makes buying easy and secure.
        </p>
      </section>

      {/* FAQ Section */}
      <section className="section faq-section">
        <h2 className="section-title">FAQs</h2>
        <div className="faq-list">
          <div className="faq-item">
            <h4 className="faq-question">Where do you ship from?</h4>
            <p className="faq-answer">All products are fulfilled through Amazon, so shipping is fast and reliable.</p>
          </div>
          <div className="faq-item">
            <h4 className="faq-question">Are your watches authentic?</h4>
            <p className="faq-answer">Yes — we source and resell 100% authentic watches, primarily OLEVS and similar brands.</p>
          </div>
          <div className="faq-item">
            <h4 className="faq-question">How do I order?</h4>
            <p className="faq-answer">Click any product's “View on Amazon” button to be taken directly to the product listing.</p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="section contact-section">
        <h2 className="section-title">Contact Us</h2>
        <div className="contact-info">
          <p><Mail className="icon" /> contact@clokka.com</p>
          <p><Phone className="icon" /> +44 1234 567890</p>
          <p><MapPin className="icon" /> London, UK</p>
        </div>
      </section>

      <footer className="footer">
        © 2025 Clokka. All rights reserved.
      </footer>
    </main>
  );
}
