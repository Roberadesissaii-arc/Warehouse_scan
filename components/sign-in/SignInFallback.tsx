export function SignInFallback() {
  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-card-head">
          <h1 className="auth-title">
            Warehouse <em>Scan</em>
          </h1>
        </div>
        <div className="auth-form" aria-hidden>
          <div className="input-field">
            <span>Username</span>
            <div className="auth-field-placeholder" />
          </div>
          <div className="input-field">
            <span>Password</span>
            <div className="auth-field-placeholder" />
          </div>
          <div className="auth-field-placeholder auth-field-placeholder--btn" />
        </div>
      </div>
    </div>
  );
}
