import React from 'react';
import ProviderLogin from '../../components/ProviderLogin';

const HospitalLogin = () => {
  return (
    <ProviderLogin
      type="hospital"
      title="Hospital Login"
      icon="🏥"
      registerPath="/hospital/register"
      dashboardPath="/hospital/dashboard"
    />
  );
};

export default HospitalLogin;