/**
 * Flashcard English Pro - Shared UI Components (Facade Module)
 * Re-exports all component controllers for backward compatibility
 */

import { mountGlobalModals } from './components/shell.js';
import { showToast, showConfirm } from './components/toast.js';
import { setupSearch } from './components/search.js';
import { showStreakHubModal } from './components/streak-hub.js';
import { openCustomStudyModal } from './components/custom-study.js';
import { openBehavioralOptimizerModal } from './components/optimizer-modal.js';

export {
  mountGlobalModals,
  showToast,
  showConfirm,
  setupSearch,
  showStreakHubModal,
  openCustomStudyModal,
  openBehavioralOptimizerModal
};
