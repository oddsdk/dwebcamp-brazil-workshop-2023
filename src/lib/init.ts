import * as odd from '@oddjs/odd'

import { dev } from '$app/environment'
import { filesystemStore, sessionStore, getStartedViewedStore } from '../stores'
import { getBackupStatus, type BackupStatus } from '$lib/auth/backup'
import { initializeLocalOnlyFs, getLocalOnlyFs } from './filesystem/local'
import { USERNAME_STORAGE_KEY, createDID } from '$lib/auth/account'
import { oddNamespace } from '$lib/app-info'
import { viewedGetStarted } from './session'

// Initialize TFJS and models
import '@tensorflow/tfjs-core'
import '@tensorflow/tfjs-backend-webgl'
import '@mediapipe/face_mesh'

export const initialize = async (): Promise<void> => {
  try {
    let backupStatus: BackupStatus = null

    const program: odd.Program = await odd.program({
      namespace: oddNamespace,
      debug: dev
    })

    if (program.session) {
      // Authed
      backupStatus = await getBackupStatus(program.session.fs)

      let fullUsername = await program.components.storage.getItem(USERNAME_STORAGE_KEY) as string

      // If the user is migrating from a version odd-app-template before https://github.com/oddsdk/odd-app-template/pull/97/files#diff-a180510e798b8f833ebfdbe691c5ec4a1095076980d3e2388de29c849b2b8361R44,
      // their username won't contain a did, so we will need to manually append a DID and add it storage here
      if (!fullUsername) {
        const did = await createDID(program.components.crypto)
        fullUsername = `${program.session.username}#${did}`
        await program.components.storage.setItem(USERNAME_STORAGE_KEY, fullUsername)
        window.location.reload()
      }

      sessionStore.set({
        username: {
          full: fullUsername,
          hashed: program.session.username,
          trimmed: fullUsername.split('#')[ 0 ],
        },
        session: program.session,
        authStrategy: program.auth,
        program,
        loading: false,
        backupCreated: backupStatus.created
      })

      filesystemStore.set(program.session.fs)

      const viewed = await viewedGetStarted()
      getStartedViewedStore.set(viewed)
    } else {
      const localOnlyFs = await getLocalOnlyFs()
      await initializeLocalOnlyFs(localOnlyFs)

      filesystemStore.set(localOnlyFs)

      const viewed = await viewedGetStarted()
      getStartedViewedStore.set(viewed)

      // Not authed
      sessionStore.set({
        username: null,
        session: null,
        authStrategy: program.auth,
        program,
        loading: false,
        backupCreated: null
      })

    }

  } catch (error) {
    console.error(error)

    switch (error) {
      case odd.ProgramError.InsecureContext:
        sessionStore.update(session => ({
          ...session,
          loading: false,
          error: 'Insecure Context'
        }))
        break

      case odd.ProgramError.UnsupportedBrowser:
        sessionStore.update(session => ({
          ...session,
          loading: false,
          error: 'Unsupported Browser'
        }))
        break
    }

  }
}