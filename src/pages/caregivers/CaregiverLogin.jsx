import React from 'react';
import ProviderLogin from '../../components/ProviderLogin';

const CaregiverLogin = () => {
  return (
    <ProviderLogin
      type="caregiver"
      title="Caregiver Login"
      icon="🏠"
      registerPath="/caregiver/register"
      dashboardPath="/caregiver/dashboard"
    />
  );
};

export default CaregiverLogin;