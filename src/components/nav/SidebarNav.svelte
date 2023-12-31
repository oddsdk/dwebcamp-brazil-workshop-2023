<script lang="ts">
  import { goto } from '$app/navigation'
  import { page } from '$app/stores'
  import { migrateToLocalOnlyFs } from '$lib/filesystem/local'
  import { sessionStore, getStartedViewedStore } from '$src/stores'
  import About from '$components/icons/About.svelte'
  import Avatars from '$components/icons/Avatars.svelte'
  import BrandLogo from '$components/icons/BrandLogo.svelte'
  import Disconnect from '$components/icons/Disconnect.svelte'
  import Home from '$components/icons/Home.svelte'
  import PhotoGallery from '$components/icons/PhotoGallery.svelte'
  import Settings from '$components/icons/Settings.svelte'
  import NavItem from '$components/nav/NavItem.svelte'

  const navItemsUpper = [
    {
      label: 'Home',
      href: '/',
      icon: Home,
      authed: false
    },
    {
      label: 'Photo Gallery Demo',
      href: '/gallery/',
      icon: PhotoGallery,
      authed: false
    },
    {
      label: 'Avatars',
      href: '/avatars/',
      icon: Avatars,
      authed: false
    },
    {
      label: 'Account Settings',
      href: '/settings/',
      icon: Settings,
      authed: true
    }
  ]

  const navItemsLower = [
    {
      label: 'About This Template',
      href: '/about/',
      icon: About,
      placement: 'bottom',
      authed: false
    },
    {
      label: 'Disconnect',
      callback: async () => {
        await migrateToLocalOnlyFs()
        await $sessionStore.session.destroy()
        // Force a hard refresh to ensure everything is disconnected properly
        window.location.href = window.location.origin
      },
      icon: Disconnect,
      placement: 'bottom',
      authed: true
    }
  ]

  let checked = false
  const handleCloseDrawer = (): void => {
    checked = false
  }
</script>

<!-- Only render the nav if the user has gotten started and is not in the connection flow -->
<div class="drawer drawer-mobile h-screen">
  <input id="sidebar-nav" class="drawer-toggle" type="checkbox" bind:checked />
  <div class="drawer-content flex flex-col">
    <slot />
  </div>
  <div
    class="drawer-side {$page.url.pathname.match(
      /register|backup|delegate|recover/
    ) || !$getStartedViewedStore
      ? '!hidden'
      : ''}"
  >
    <label
      for="sidebar-nav"
      class="drawer-overlay !bg-[#262626] !opacity-[.85]"
    />
    <div class="menu p-4 overflow-y-auto w-80 bg-base-100 text-base-content">
      <!-- Brand -->
      <div
        class="flex items-center cursor-pointer gap-3 dark:text-odd-gray-200 mb-10"
        on:click={() => {
          handleCloseDrawer()
          goto('/')
        }}
        on:keypress={() => {
          handleCloseDrawer()
          goto('/')
        }}
      >
        <BrandLogo />
        <span class="font-sans text-heading-m">Avatars</span>
      </div>

      <!-- Upper Menu -->
      <ul>
        {#each navItemsUpper as item}
          {#if !item.authed || ($sessionStore.session && item.authed)}
            <NavItem {item} {handleCloseDrawer} />
          {/if}
        {/each}
      </ul>

      <!-- Lower Menu -->
      <ul class="mt-auto pb-8">
        {#each navItemsLower as item}
          {#if !item.authed || ($sessionStore.session && item.authed)}
            <NavItem {item} {handleCloseDrawer} />
          {/if}
        {/each}
      </ul>
    </div>
  </div>
</div>
