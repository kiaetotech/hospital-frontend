import React from 'react';
import ProviderLogin from '../../components/ProviderLogin';

const InsuranceCompanyLogin = () => {
  return (
    <ProviderLogin
      type="insurance"
      title="Insurance Company Login"
      icon="🛡️"
      registerPath="/insurance/company/register"
      dashboardPath="/insurance/company/dashboard"
    />
  );
};

export default InsuranceCompanyLogin;