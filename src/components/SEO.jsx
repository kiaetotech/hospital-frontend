import React from 'react';
import { Helmet } from 'react-helmet';

const SEO = ({ 
  title, 
  description, 
  keywords,
  image = 'https://hospital-frontend-kiaeto.vercel.app/og-image.png',
  url,
  type = 'website'
}) => {
  const siteName = 'HealthCare Hub';
  const defaultTitle = 'HealthCare Hub — India\'s Most Trusted Healthcare Marketplace';
  const defaultDesc = 'Find hospitals, book doctors, lab tests, ambulance, Ayurveda, homeopathy, mental health, caregivers, insurance & corporate health plans. All in one platform.';
  const defaultKeywords = 'hospital, doctor, lab test, ambulance, ayurveda, homeopathy, mental health, caregiver, health insurance, corporate health, OPD booking, online doctor consultation';

  const pageTitle = title ? `${title} | ${siteName}` : defaultTitle;
  const pageUrl = url || (typeof window !== 'undefined' ? window.location.href : 'https://hospital-frontend-kiaeto.vercel.app');

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "MedicalOrganization",
    "name": "HealthCare Hub",
    "description": description || defaultDesc,
    "url": "https://hospital-frontend-kiaeto.vercel.app",
    "areaServed": "India",
    "serviceType": ["Hospital", "Doctor", "Ambulance", "Lab Tests", "Ayurveda", "Homeopathy", "Mental Health", "Home Care", "Insurance", "Corporate Health"]
  };

  return (
    <Helmet>
      <title>{pageTitle}</title>
      <meta name="description" content={description || defaultDesc} />
      <meta name="keywords" content={keywords || defaultKeywords} />
      <meta name="robots" content="index, follow" />
      <meta name="author" content="HealthCare Hub" />
      <meta name="geo.region" content="IN" />
      <meta name="geo.placename" content="India" />
      
      <link rel="canonical" href={pageUrl} />
      
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={description || defaultDesc} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={pageUrl} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content="en_IN" />
      
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={description || defaultDesc} />
      <meta name="twitter:image" content={image} />
      
      <meta name="application-name" content={siteName} />
      <meta name="theme-color" content="#1976d2" />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      <meta name="apple-mobile-web-app-title" content={siteName} />
      
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
    </Helmet>
  );
};

export default SEO;

