<script lang="ts">
  import { goto } from '$app/navigation'
  import clipboardCopy from 'clipboard-copy'

  import Share from '$components/icons/Share.svelte'
  import { addNotification } from '$lib/notifications'

  export let qrcode: HTMLOrSVGElement
  export let connectionLink: string
  export let backupCreated: boolean

  const copyLink = async () => {
    await clipboardCopy(connectionLink)
    addNotification('Copied to clipboard', 'success')
  }
</script>

<input type="checkbox" id="backup-device-modal" checked class="modal-toggle" />
<div class="modal">
  <div class="modal-box relative text-center">
    <div>
      <h3 class="mb-8 text-heading-lg">Connect a backup device</h3>
      <div class="w-max m-auto mb-7 rounded overflow-hidden">
        {@html qrcode}
      </div>
      <p class="mb-7">
        Scan this code on the new device, or share the connection link.
      </p>
      <div class="flex flex-col items-center gap-2">
        <button class="btn btn-outline" on:click={copyLink}>
          <Share />
          <span class="ml-2">Share connection link</span>
        </button>
        {#if !backupCreated}
          <button
            class="btn btn-clear"
            on:click={() => goto('/backup?view=are-you-sure')}
          >
            Skip for now
          </button>
        {:else}
          <a
            class="btn btn-clear"
            href="/"
          >
            Cancel
          </a>
        {/if}
      </div>
    </div>
  </div>
</div>
