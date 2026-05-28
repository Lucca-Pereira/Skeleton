<script>
  import { authReady, currentUser, signIn } from './auth.js';

  let signingIn = $state(false);
  let error     = $state('');

  async function handleSignIn() {
    signingIn = true;
    error = '';
    try {
      await signIn();
    } catch (e) {
      error = 'Sign-in failed. Please try again.';
    } finally {
      signingIn = false;
    }
  }
</script>

{#if !$authReady || (!$currentUser && $authReady)}
  <div class="overlay">
    <div class="card">
      <h1>Skeleton</h1>
      <p>3D anatomy learning tool</p>

      {#if !$authReady}
        <div class="spinner"></div>
      {:else}
        <button class="google-btn" onclick={handleSignIn} disabled={signingIn}>
          {#if signingIn}
            Signing in…
          {:else}
            <svg viewBox="0 0 24 24" width="18" height="18">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Sign in with Google
          {/if}
        </button>
        {#if error}<p class="error">{error}</p>{/if}
      {/if}
    </div>
  </div>
{/if}

<style>
  .overlay {
    position: fixed;
    inset: 0;
    background: #111;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }

  .card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    padding: 48px 40px;
    background: #1a1a1a;
    border: 1px solid #2a2a2a;
    border-radius: 12px;
    min-width: 300px;
  }

  h1 {
    margin: 0;
    font-family: monospace;
    font-size: 28px;
    color: #fff;
    letter-spacing: 2px;
  }

  p {
    margin: 0;
    font-family: monospace;
    font-size: 12px;
    color: #555;
  }

  .google-btn {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-top: 12px;
    padding: 10px 20px;
    background: #fff;
    color: #333;
    border: none;
    border-radius: 6px;
    font-size: 14px;
    font-family: monospace;
    cursor: pointer;
    transition: background 0.15s;
  }

  .google-btn:hover:not(:disabled) { background: #f0f0f0; }
  .google-btn:disabled { opacity: 0.6; cursor: default; }

  .error {
    color: #c44;
    font-size: 11px;
    font-family: monospace;
  }

  .spinner {
    width: 24px;
    height: 24px;
    border: 2px solid #333;
    border-top-color: #aaa;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
    margin-top: 12px;
  }

  @keyframes spin { to { transform: rotate(360deg); } }
</style>
