import React from 'react';
import { Helmet } from 'react-helmet';

const SEO = ({ title, description, keywords }) => {
  const siteName = 'Ayurveda Wellness Hub';
  const defaultDesc = 'Find verified Ayurvedic doctors & Panchakarma centers near you. Book online consultations, AI Prakriti analysis, wellness packages. AYUSH-registered practitioners.';

  return (
    <Helmet>
      <title>{title ? `${title} | ${siteName}` : siteName}</title>
      <meta name="description" content={description || defaultDesc} />
      <meta name="keywords" content={keywords || 'ayurveda, ayurvedic doctor, panchakarma, prakriti, online ayurveda consultation, ayurvedic treatment, wellness center'} />
      <meta property="og:title" content={title || siteName} />
      <meta property="og:description" content={description || defaultDesc} />
      <meta property="og:type" content="website" />
      <meta name="twitter:card" content="summary_large_image" />
      <link rel="canonical" href={window.location.href} />
    </Helmet>
  );
};

export default SEO;
