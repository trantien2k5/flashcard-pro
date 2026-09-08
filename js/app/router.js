/**
 * Application Router - Handles Tab Switching, Subpage Navigation & Scroll Position
 */

import { scrollToTop } from '../utils/dom.js';

export class AppRouter {
  /**
   * @param {import('./app.js').FlashcardApp} app
   */
  constructor(app) {
    this.app = app;
    this.activeTab = 'tab-review';
    this.previousTab = 'tab-review';
  }

  /**
   * Thiết lập các event listener điều hướng tabs và nút Back cho subpages
   */
  setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
      item.addEventListener('click', () => {
        try {
          const targetTab = item.getAttribute('data-tab');
          this.switchTab(targetTab);
        } catch (err) {
          console.error('Lỗi chuyển tab bottom nav:', err);
        }
      });
    });

    // Nút Hồ sơ trên Header góc phải cùng
    const btnHeaderProfile = document.getElementById('btn-header-profile');
    if (btnHeaderProfile) {
      btnHeaderProfile.addEventListener('click', () => {
        try {
          this.switchTab('tab-profile');
        } catch (err) {
          console.error('Lỗi btn-header-profile:', err);
        }
      });
    }

    // Nút Quay lại từ trang chủ đề (Level 2) về danh sách tất cả chủ đề
    const btnBack = document.getElementById('btn-back-to-decks');
    if (btnBack) {
      btnBack.addEventListener('click', () => {
        try {
          this.switchTab(this.previousTab || 'tab-decks');
        } catch (err) {
          console.error('Lỗi btn-back-to-decks:', err);
        }
      });
    }

    // Nút Quay lại từ trang chi tiết chủ đề con (Level 3) về danh sách chủ đề con (Level 2)
    const btnBackSubtopic = document.getElementById('btn-back-to-subtopics');
    if (btnBackSubtopic) {
      btnBackSubtopic.addEventListener('click', () => {
        try {
          if (this.app.currentSubtopicsDeckId) {
            this.app.openSubtopicsPage(this.app.currentSubtopicsDeckId);
          } else {
            this.switchTab('tab-decks');
          }
        } catch (err) {
          console.error('Lỗi btn-back-to-subtopics:', err);
        }
      });
    }

    // Nút Quay lại từ trang danh sách từ vựng (Level 4) về danh sách chủ đề con (Level 2)
    const btnBackToSubtopicDetail = document.getElementById('btn-back-to-subtopic-detail');
    if (btnBackToSubtopicDetail) {
      btnBackToSubtopicDetail.addEventListener('click', () => {
        try {
          if (this.app.currentSubtopicsDeckId) {
            this.app.openSubtopicsPage(this.app.currentSubtopicsDeckId);
          } else {
            this.switchTab('tab-decks');
          }
        } catch (err) {
          console.error('Lỗi btn-back-to-subtopic-detail:', err);
        }
      });
    }
  }

  /**
   * Chuyển đổi màn hình tab
   * @param {string} tabId 
   */
  switchTab(tabId) {
    try {
      const isSubpageTarget = (tabId === 'tab-subtopics' || tabId === 'tab-subtopic-words');
      if (!isSubpageTarget) {
        this.previousTab = tabId;
        this.app.previousTab = tabId;
      }
      this.activeTab = tabId;
      this.app.activeTab = tabId;

      // Đánh dấu trạng thái subpage trên body để CSS ẩn Header/Nav mượt mà
      document.body.classList.toggle('subpage-view-active', isSubpageTarget);

      // Cập nhật tab panes
      const panes = document.querySelectorAll('.tab-pane');
      panes.forEach(pane => {
        pane.classList.toggle('active', pane.id === tabId);
      });

      // Cập nhật nav buttons
      const navTargetId = isSubpageTarget ? (this.previousTab || 'tab-review') : tabId;
      document.querySelectorAll('.nav-item').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-tab') === navTargetId);
      });

      // Cập nhật trạng thái nút hồ sơ trên header
      const btnHeaderProfile = document.getElementById('btn-header-profile');
      if (btnHeaderProfile) {
        btnHeaderProfile.classList.toggle('active', tabId === 'tab-profile');
      }

      // Cuộn đầu trang mượt mà
      scrollToTop();

      // Làm mới dữ liệu tab khi kích hoạt
      if (tabId === 'tab-review' || tabId === 'tab-home') this.app.renderReviewTab();
      else if (tabId === 'tab-decks') this.app.renderDecksTab();
      else if (tabId === 'tab-stats') this.app.renderStatsTab();
      else if (tabId === 'tab-profile') this.app.renderProfileTab();
      else if (tabId === 'tab-subtopics' && this.app.currentSubtopicsDeckId) {
        this.app.renderSubtopicsPage(this.app.currentSubtopicsDeckId);
      } else if (tabId === 'tab-subtopic-words' && this.app.currentSubtopicsDeckId && this.app.currentSubtopicName) {
        this.app.renderSubtopicWordsPage(this.app.currentSubtopicsDeckId, this.app.currentSubtopicName);
      }

    } catch (err) {
      console.error(`Lỗi trong AppRouter.switchTab(${tabId}):`, err);
    }
  }
}
