<script>
  import { editMode } from '../editor/stores.js';
  import { quizMuscle, quizSelections, quizResult, quizScore, quizReady, nextMuscle, retryMuscle } from './stores.js';
</script>

{#if $quizReady && !$editMode}
  <div class="panel">

    <div class="score">{$quizScore.correct} / {$quizScore.total}</div>

    <div class="prompt">Select the origin & insertion of:</div>
    <div class="muscle-name">{$quizMuscle?.name ?? ''}</div>

    {#if !$quizResult}
      <div class="selections">
        <div class="sel" class:active={$quizSelections.length === 0}>
          <span class="num">①</span>
          <span class:picked={$quizSelections.length >= 1}>
            {$quizSelections[0] ?? 'Click a zone on the bone'}
          </span>
        </div>
        <div class="sel" class:active={$quizSelections.length === 1}>
          <span class="num">②</span>
          <span class:picked={$quizSelections.length >= 2}>
            {$quizSelections[1] ?? 'Click a second zone'}
          </span>
        </div>
      </div>
      <button class="btn skip" onclick={nextMuscle}>Skip →</button>

    {:else}
      <div class="result" class:correct={$quizResult === 'correct'} class:wrong={$quizResult === 'incorrect'}>
        {$quizResult === 'correct' ? '✓ Correct!' : '✗ Incorrect'}
      </div>

      {#if $quizResult === 'incorrect'}
        <div class="answer">
          <div><span class="tag o-tag">O</span> {$quizMuscle.origin}</div>
          <div><span class="tag i-tag">I</span> {$quizMuscle.insertion}</div>
        </div>
      {/if}

      <div class="btn-row">
        {#if $quizResult === 'incorrect'}
          <button class="btn secondary" onclick={retryMuscle}>Try Again</button>
        {/if}
        <button class="btn primary" onclick={nextMuscle}>Next →</button>
      </div>
    {/if}

  </div>
{/if}

<style>
  .panel {
    position: fixed;
    bottom: 30px;
    left: 30px;
    background: rgba(10, 10, 10, 0.92);
    color: #fff;
    padding: 18px 20px;
    border-radius: 10px;
    font-family: monospace;
    width: 270px;
    z-index: 100;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .score {
    font-size: 11px;
    color: #555;
    text-align: right;
  }

  .prompt {
    font-size: 11px;
    color: #666;
  }

  .muscle-name {
    font-size: 22px;
    font-weight: bold;
    color: #fff;
    line-height: 1.2;
  }

  .selections {
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding-top: 4px;
  }

  .sel {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 11px;
    color: #444;
    transition: color 0.2s;
  }

  .sel.active { color: #aaa; }

  .num {
    font-size: 13px;
    flex-shrink: 0;
  }

  .picked { color: #fff; }

  .result {
    font-size: 16px;
    font-weight: bold;
    padding: 8px 0 4px;
  }

  .correct { color: #4d4; }
  .wrong   { color: #d44; }

  .answer {
    display: flex;
    flex-direction: column;
    gap: 4px;
    font-size: 11px;
    color: #777;
  }

  .tag {
    font-size: 9px;
    padding: 1px 4px;
    border-radius: 2px;
    margin-right: 4px;
  }

  .o-tag { background: #2a3d2a; color: #7c7; }
  .i-tag { background: #2a2a3d; color: #77c; }

  .btn-row {
    display: flex;
    gap: 8px;
    padding-top: 4px;
  }

  .btn {
    padding: 7px 14px;
    border-radius: 5px;
    border: none;
    cursor: pointer;
    font-family: monospace;
    font-size: 12px;
    flex: 1;
  }

  .primary   { background: #2a4a2a; color: #8d8; }
  .primary:hover   { background: #355a35; }
  .secondary { background: #2a2a2a; color: #888; }
  .secondary:hover { background: #333; color: #aaa; }
  .skip { background: none; color: #444; border: 1px solid #2a2a2a; font-size: 11px; padding: 5px 10px; flex: none; align-self: flex-end; }
  .skip:hover { color: #888; border-color: #444; }
</style>
