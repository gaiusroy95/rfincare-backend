import React, { useState, useEffect, useMemo } from 'react';
import Header from '../../components/ui/Header';
import Footer from '../homepage/components/Footer';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { useSiteContact } from '../../contexts/SiteContactContext';

const ContactUs = () => {
  const { contact } = useSiteContact();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const contactInfo = useMemo(
    () => [
      {
        icon: 'Phone',
        title: 'Phone',
        details: (contact.phones || [contact.phone]).filter(Boolean).map((p) =>
          p.startsWith('+') ? p : `+91-${p}`,
        ),
        description: 'Mon-Sat, 9 AM - 6 PM',
      },
      {
        icon: 'Mail',
        title: 'Email',
        details: contact.emails?.length ? contact.emails : [contact.email],
        description: "We'll respond within 24 hours",
      },
    ],
    [contact],
  );

  const officeAddresses = useMemo(() => {
    if (contact.offices?.length) return contact.offices;
    return [
      { title: 'Reg. Office', address: contact.registeredAddress },
      { title: 'Branch Office', address: contact.branchAddress },
    ].filter((o) => o.address);
  }, [contact]);

  const handleInputChange = (e) => {
    const { name, value } = e?.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    // In real implementation, this would send data to backend
    console.log('Form submitted:', formData);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main>
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary via-secondary to-accent text-white py-16 md:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Contact Us</h1>
            <p className="text-lg md:text-xl text-white/90 max-w-3xl mx-auto">
              Have questions? We're here to help. Reach out to us anytime.
            </p>
          </div>
        </section>

        {/* Contact Info Cards */}
        <section className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              {contactInfo?.map((info, index) => (
                <div key={index} className="bg-gray-50 rounded-xl p-6 text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon name={info?.icon} size={32} color="#6366f1" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{info?.title}</h3>
                  {info?.details?.map((detail, idx) => (
                    <p key={idx} className="text-gray-700 font-medium">{detail}</p>
                  ))}
                  <p className="text-sm text-gray-500 mt-2">{info?.description}</p>
                </div>
              ))}
            </div>
            
            {/* Office Addresses */}
            <div className="mt-8">
              <h2 className="text-2xl font-bold text-center mb-6">Our Offices</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {officeAddresses?.map((office, index) => (
                  <div key={index} className="bg-gray-50 rounded-xl p-6">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                      <Icon name="MapPin" size={24} color="#6366f1" />
                    </div>
                    <h3 className="text-lg font-semibold mb-3">{office?.title}</h3>
                    <p className="text-gray-700 text-sm leading-relaxed">{office?.address}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Contact Form */}
        <section className="py-12 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
              <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center">Send Us a Message</h2>
              
              {submitted ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon name="CheckCircle" size={40} color="white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Message Sent!</h3>
                  <p className="text-gray-600">Thank you for contacting us. We'll get back to you soon.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium mb-2">Full Name *</label>
                      <Input
                        type="text"
                        name="name"
                        value={formData?.name}
                        onChange={handleInputChange}
                        placeholder="John Doe"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Email Address *</label>
                      <Input
                        type="email"
                        name="email"
                        value={formData?.email}
                        onChange={handleInputChange}
                        placeholder="john@example.com"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium mb-2">Phone Number *</label>
                      <Input
                        type="tel"
                        name="phone"
                        value={formData?.phone}
                        onChange={handleInputChange}
                        placeholder="+91 98765 43210"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Subject *</label>
                      <Input
                        type="text"
                        name="subject"
                        value={formData?.subject}
                        onChange={handleInputChange}
                        placeholder="How can we help?"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Message *</label>
                    <textarea
                      name="message"
                      value={formData?.message}
                      onChange={handleInputChange}
                      rows="6"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Tell us more about your inquiry..."
                      required
                    />
                  </div>

                  <Button type="submit" variant="default" size="lg" className="w-full">
                    Send Message
                  </Button>
                </form>
              )}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-2">What are your business hours?</h3>
                <p className="text-gray-600">We're available Monday to Saturday, 9 AM to 6 PM IST. Our online services are available 24/7.</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-2">How long does loan approval take?</h3>
                <p className="text-gray-600">Most loan applications are processed within 24-48 hours. Complex cases may take up to 5 business days.</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-2">Is my information secure?</h3>
                <p className="text-gray-600">Yes, we use bank-grade encryption and follow strict data protection regulations to keep your information safe.</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-2">Do you charge for eligibility checks?</h3>
                <p className="text-gray-600">No, our eligibility assessment service is completely free with no hidden charges.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default ContactUs;