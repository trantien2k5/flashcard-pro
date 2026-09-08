/**
 * Application Entry Point Bridge
 * Forwards to modular application core in js/app/app.js
 */

export * from './app/app.js';
export { FlashcardApp, bootstrap } from './app/app.js';
import './app/app.js';
