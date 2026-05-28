<script>
  import { currentUser, userRole, signOut } from './auth.js';
  import { editMode } from '../editor/stores.js';

  const ROLE_LABEL = { admin: 'Admin', teacher: 'Teacher', student: 'Student' };
  const ROLE_COLOR = { admin: '#f80', teacher: '#4af', student: '#888' };

  let open = $state(false);

  const canEdit = $derived($userRole === 'admin' || $userRole === 'teacher');

  function toggleEditor() {
    editMode.update(v => !v);
    open = false;
  }

  function handleSignOut() {
    open = false;
    signOut();
  }
</script>

{#if $currentUser}
  <div class="wrapper">
    <button class="trigger" onclick={() => open = !open}>
      {#if $currentUser.photoURL}
        <img class="avatar" src={$currentUser.photoURL} alt="avatar" referrerpolicy="no-referrer" />
      {/if}
      <span class="name">{$currentUser.displayName ?? $currentUser.email}</span>
      {#if $userRole}
        <span class="role" style:color={ROLE_COLOR[$userRole]}>{ROLE_LABEL[$userRole]}</span>
      {/if}
      <span class="caret">{open ? '▲' : '▼'}</span>
    </button>

    {#if open}
      <div class="dropdown">
        {#if canEdit}
          <button onclick={toggleEditor}>
            {$editMode ? 'Close editor' : 'Open editor'}
          </button>
          <div class="divider"></div>
        {/if}
        <button class="signout" onclick={handleSignOut}>Sign out</button>
      </div>
    {/if}
  </div>
{/if}

<!-- close dropdown when clicking outside -->
{#if open}
  <div class="backdrop" onclick={() => open = false}></div>
{/if}

<style>
  .wrapper {
    position: fixed;
    top: 12px;
    right: 12px;
    z-index: 50;
    font-family: monospace;
    font-size: 11px;
  }

  .trigger {
    display: flex;
    align-items: center;
    gap: 8px;
    background: rgba(10,10,10,0.88);
    border: 1px solid #2a2a2a;
    border-radius: 8px;
    padding: 6px 10px;
    color: #aaa;
    cursor: pointer;
    font-family: monospace;
    font-size: 11px;
    width: 100%;
  }

  .trigger:hover { border-color: #444; }

  .avatar {
    width: 22px;
    height: 22px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .name {
    max-width: 130px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: #ccc;
  }

  .role { font-weight: bold; font-size: 10px; flex-shrink: 0; }
  .caret { font-size: 8px; color: #444; flex-shrink: 0; }

  .dropdown {
    position: absolute;
    top: calc(100% + 4px);
    right: 0;
    min-width: 100%;
    background: rgba(10,10,10,0.95);
    border: 1px solid #2a2a2a;
    border-radius: 8px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .dropdown button {
    background: none;
    border: none;
    color: #aaa;
    padding: 8px 14px;
    cursor: pointer;
    font-family: monospace;
    font-size: 11px;
    text-align: left;
    white-space: nowrap;
  }

  .dropdown button:hover { background: #1a1a1a; color: #fff; }
  .dropdown .signout:hover { color: #c44; }

  .divider { border-top: 1px solid #222; margin: 0; }

  .backdrop {
    position: fixed;
    inset: 0;
    z-index: 49;
  }
</style>
