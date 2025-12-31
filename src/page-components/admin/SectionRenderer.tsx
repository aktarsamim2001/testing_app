import React from 'react';
import Section1Home from './home/Section1';
import Section2Home from './home/Section2';
import Section3Home from './home/Section3';
import Section4Home from './home/Section4';
import Section1Creators from './creators/Section1';
import Section2Creators from './creators/Section2';
import Section3Creators from './creators/Section3';
import Section4Creators from './creators/Section4';
import Section5Creators from './creators/Section5';
import Section1Services from './services/Section1';
import Section2Services from './services/Section2';
import Section3Services from './services/Section3';
import Section1HowItWorks from './how-it-works/Section1';
import Section2HowItWorks from './how-it-works/Section2';
import Section3HowItWorks from './how-it-works/Section3';
import Section4HowItWorks from './how-it-works/Section4';
import Section1Pricing from './pricing/Section1';
import Section2Pricing from './pricing/Section2';
import Section3Pricing from './pricing/Section3';
import Section4Pricing from './pricing/Section4';
import Section5Pricing from './pricing/Section5';
import Section1About from './about/Section1';
import Section2About from './about/Section2';
import Section3About from './about/Section3';
import Section4About from './about/Section4';
import Section5About from './about/Section5';
import Section6About from './about/Section6';
import Section1Contact from './contact/Section1';
import Section2Contact from './contact/Section2';
import Section1Blog from './blog/Section1';

const SectionRenderer = ({ section, formData, loading, updateSlide, addSlide, removeSlide }: any) => {
  // Home
  if (formData.template === 'home') {
    if (section.type === 'hero') return <Section1Home section={section} loading={loading} updateSlide={updateSlide} addSlide={addSlide} />;
    if (section.type === 'channels') return <Section2Home section={section} loading={loading} updateSlide={updateSlide} addSlide={addSlide} />;
    if (section.type === 'stats') return <Section4Home section={section} loading={loading} updateSlide={updateSlide} addSlide={addSlide} showButton={section.name !== 'Section 3'} />;
    return <Section3Home section={section} loading={loading} updateSlide={updateSlide} addSlide={addSlide} showButton={section.name !== 'Section 3'} />;
  }
  // Creators
  if (formData.template === 'creators') {
    if (section.id === 'hero') return <Section1Creators section={section} loading={loading} updateSlide={updateSlide} addSlide={addSlide} removeSlide={removeSlide} />;
    if (section.id === 'channels') return <Section2Creators section={section} loading={loading} updateSlide={updateSlide} addSlide={addSlide} removeSlide={removeSlide} />;
    if (section.id === 'features') return <Section3Creators section={section} loading={loading} updateSlide={updateSlide} addSlide={addSlide} removeSlide={removeSlide} />;
    if (section.id === 'stats') return <Section4Creators section={section} loading={loading} updateSlide={updateSlide} addSlide={addSlide} removeSlide={removeSlide} />;
    return <Section5Creators section={section} loading={loading} updateSlide={updateSlide} addSlide={addSlide} removeSlide={removeSlide} />;
  }
  // Services
  if (formData.template === 'services') {
    if (section.id === 'hero') return <Section1Services section={section} loading={loading} updateSlide={updateSlide} addSlide={addSlide} removeSlide={removeSlide} />;
    if (section.id === 'channels') return <Section2Services section={section} loading={loading} updateSlide={updateSlide} addSlide={addSlide} removeSlide={removeSlide} />;
    if (section.id === 'features') return <Section3Services section={section} loading={loading} updateSlide={updateSlide} addSlide={addSlide} removeSlide={removeSlide} />;
    return null;
  }
  // How It Works
  if (formData.template === 'how-it-works') {
    if (section.id === 'hero') return <Section1HowItWorks section={section} loading={loading} updateSlide={updateSlide} addSlide={addSlide} removeSlide={removeSlide} />;
    if (section.id === 'channels') return <Section2HowItWorks section={section} loading={loading} updateSlide={updateSlide} addSlide={addSlide} removeSlide={removeSlide} />;
    if (section.id === 'features') return <Section3HowItWorks section={section} loading={loading} updateSlide={updateSlide} addSlide={addSlide} removeSlide={removeSlide} />;
    if (section.id === 'stats') return <Section4HowItWorks section={section} loading={loading} updateSlide={updateSlide} addSlide={addSlide} removeSlide={removeSlide} />;
    return null;
  }
  // Pricing
  if (formData.template === 'pricing') {
    if (section.id === 'hero') return <Section1Pricing section={section} loading={loading} updateSlide={updateSlide} addSlide={addSlide} removeSlide={removeSlide} />;
    if (section.id === 'channels') return <Section2Pricing section={section} loading={loading} updateSlide={updateSlide} addSlide={addSlide} removeSlide={removeSlide} />;
    if (section.id === 'features') return <Section3Pricing section={section} loading={loading} updateSlide={updateSlide} addSlide={addSlide} removeSlide={removeSlide} />;
    if (section.id === 'stats') return <Section4Pricing section={section} loading={loading} updateSlide={updateSlide} addSlide={addSlide} removeSlide={removeSlide} />;
    if (section.id === 'section5') return <Section5Pricing section={section} loading={loading} updateSlide={updateSlide} addSlide={addSlide} removeSlide={removeSlide} />;
    return null;
  }
  // About
  if (formData.template === 'about') {
    if (section.id === 'hero') return <Section1About section={section} loading={loading} updateSlide={updateSlide} addSlide={addSlide} removeSlide={removeSlide} />;
    if (section.id === 'channels') return <Section2About section={section} loading={loading} updateSlide={updateSlide} addSlide={addSlide} removeSlide={removeSlide} />;
    if (section.id === 'features') return <Section3About section={section} loading={loading} updateSlide={updateSlide} addSlide={addSlide} removeSlide={removeSlide} />;
    if (section.id === 'stats') return <Section4About section={section} loading={loading} updateSlide={updateSlide} addSlide={addSlide} removeSlide={removeSlide} />;
    if (section.id === 'section5') return <Section5About section={section} loading={loading} updateSlide={updateSlide} addSlide={addSlide} removeSlide={removeSlide} />;
    if (section.id === 'section6') return <Section6About section={section} loading={loading} updateSlide={updateSlide} addSlide={addSlide} removeSlide={removeSlide} />;
    return null;
  }
  // Contact
  if (formData.template === 'contact') {
    if (section.id === 'hero') return <Section1Contact section={section} loading={loading} updateSlide={updateSlide} addSlide={addSlide} removeSlide={removeSlide} />;
    if (section.id === 'channels') return <Section2Contact section={section} loading={loading} updateSlide={updateSlide} addSlide={addSlide} removeSlide={removeSlide} />;
    return null;
  }
  // Blog
  if (formData.template === 'blog') {
    if (section.id === 'hero') return <Section1Blog section={section} loading={loading} updateSlide={updateSlide} addSlide={addSlide} removeSlide={removeSlide} />;
    return null;
  }
  return null;
};

export default SectionRenderer;
