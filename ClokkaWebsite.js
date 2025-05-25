import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Mail, Phone, MapPin } from "lucide-react";
import { motion } from "framer-motion";

export default function ClokkaWebsite() {
  const images = [
    "/Clokka 1.jpg",
    "/Clokka 2.jpg",
    "/Clokka 3.jpg",
    "/Clokka 4.jpg",
  ];

  return (
    <main className="bg-black text-white font-sans">
      <header className="sticky top-0 bg-black z-50 shadow-md py-4 px-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Clokka</h1>
        <nav className="space-x-6 text-sm">
          <a href="#shop" className="hover:text-gray-300">Shop</a>
          <a href="#about" className="hover:text-gray-300">About</a>
          <a href="#faq" className="hover:text-gray-300">FAQ</a>
          <a href="#contact" className="hover:text-gray-300">Contact</a>
        </nav>
      </header>

      <section className="min-h-screen flex flex-col items-center justify-center text-center px-6">
        <motion.h1 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="text-5xl md:text-7xl font-bold mb-4">
          Clokka
        </motion.h1>
        <p className="text-lg md:text-xl text-gray-400 max-w-xl mb-6">
          Streetwear watches curated for your vibe. Discover affordable timepieces with drip.
        </p>
        <Button className="text-black bg-white hover:bg-gray-200 rounded-full px-8 py-4 text-lg">
          Shop on Amazon
        </Button>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-16 w-full max-w-6xl">
          {images.map((src, index) => (
            <img key={index} src={src} alt={\`Clokka Showcase \${index + 1}\`} className="rounded-2xl shadow-lg w-full h-auto object-cover" />
          ))}
        </div>
      </section>

      <section id="shop" className="py-20 px-6 bg-gray-900 text-center">
        <h2 className="text-4xl font-bold mb-10">Our Picks</h2>
        <div className="grid md:grid-cols-4 gap-8">
          {images.map((src, index) => (
            <Card key={index} className="bg-black border border-gray-700">
              <CardContent className="p-4">
                <img src={src} alt={\`Clokka Watch \${index + 1}\`} className="rounded-xl mb-4 w-full h-auto object-cover" />
                <h3 className="text-xl font-semibold">Clokka Watch {index + 1}</h3>
                <p className="text-gray-400 mt-2">Sleek. Bold. Affordable.</p>
                <Button className="mt-4 w-full bg-white text-black hover:bg-gray-200">
                  View on Amazon
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section id="about" className="py-20 px-6 bg-black text-center">
        <h2 className="text-4xl font-bold mb-6">About Clokka</h2>
        <p className="text-gray-400 max-w-2xl mx-auto text-lg">
          Clokka is a streetwear-inspired watch reselling brand. We handpick sleek, affordable watches that add style without breaking the bank. Linked directly to Amazon, our shop makes buying easy and secure.
        </p>
      </section>

      <section id="faq" className="py-20 px-6 bg-gray-900 text-left max-w-3xl mx-auto">
        <h2 className="text-4xl font-bold mb-10 text-center">FAQs</h2>
        <div className="space-y-6">
          <div>
            <h4 className="text-xl font-semibold">Where do you ship from?</h4>
            <p className="text-gray-400">All products are fulfilled through Amazon, so shipping is fast and reliable.</p>
          </div>
          <div>
            <h4 className="text-xl font-semibold">Are your watches authentic?</h4>
            <p className="text-gray-400">Yes — we source and resell 100% authentic watches, primarily OLEVS and similar brands.</p>
          </div>
          <div>
            <h4 className="text-xl font-semibold">How do I order?</h4>
            <p className="text-gray-400">Click any product's “View on Amazon” button to be taken directly to the product listing.</p>
          </div>
        </div>
      </section>

      <section id="contact" className="py-20 px-6 bg-black text-center">
        <h2 className="text-4xl font-bold mb-6">Contact Us</h2>
        <div className="text-gray-400 space-y-2">
          <p><Mail className="inline mr-2" /> contact@clokka.com</p>
          <p><Phone className="inline mr-2" /> +44 1234 567890</p>
          <p><MapPin className="inline mr-2" /> London, UK</p>
        </div>
      </section>

      <footer className="text-center py-10 text-gray-600 text-sm bg-gray-900">
        © 2025 Clokka. All rights reserved.
      </footer>
    </main>
  );
}
