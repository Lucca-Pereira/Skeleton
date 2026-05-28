<script>
  import { currentUser, userRole, signOut } from './auth.js';

  const ROLE_LABEL = { admin: 'Admin', teacher: 'Teacher', student: 'Student' };
  const ROLE_COLOR = { admin: '#f80', teacher: '#4af', student: '#888' };
</script>

{#if $currentUser}
  <div class="panel">
    {#if $currentUser.photoURL}
      <img class="avatar" src={$currentUser.photoURL} alt="avatar" referrerpolicy="no-referrer" />
    {/if}
    <span class="name">{$currentUser.displayName ?? $currentUser.email}</span>
    {#if $userRole}
      <span class="role" style:color={ROLE_COLOR[$userRole]}>{ROLE_LABEL[$userRole]}</span>
    {/if}
    <button onclick={signOut}>Sign out</button>
  </div>
{/if}

<style>
  .panel {
    position: fixed;
    top: 12px;
    right: 12px;
    display: flex;
    align-items: center;
    gap: 8px;
    background: rgba(10,10,10,0.85);
    border: 1px solid #2a2a2a;
    border-radius: 8px;
    padding: 6px 10px;
    z-index: 50;
    font-family: monospace;
    font-size: 11px;
    color: #aaa;
  }

  .avatar {
    width: 22px;
    height: 22px;
    border-radius: 50%;
  }

  .name {
    max-width: 140px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: #ccc;
  }

  .role { font-weight: bold; font-size: 10px; }

  button {
    background: none;
    border: 1px solid #333;
    color: #555;
    padding: 2px 7px;
    border-radius: 4px;
    cursor: pointer;
    font-family: monospace;
    font-size: 10px;
  }

  button:hover { color: #aaa; border-color: #555; }
</style>
