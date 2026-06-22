import React from 'react';
import ProviderLogin from '../../components/ProviderLogin';

const AmbulanceLogin = () => {
  return (
    <ProviderLogin
      type="ambulance"
      title="Ambulance Login"
      icon="🚑"
      registerPath="/ambulance/register"
      dashboardPath="/ambulance/dashboard"
    />
  );
};

export default AmbulanceLogin;