import React from 'react';
import ProviderLogin from '../../components/ProviderLogin';

const DiagnosticsLogin = () => {
  return (
    <ProviderLogin
      type="diagnostics"
      title="Diagnostics Login"
      icon="🔬"
      registerPath="/diagnostics/register"
      dashboardPath="/diagnostics/dashboard"
    />
  );
};

export default DiagnosticsLogin;