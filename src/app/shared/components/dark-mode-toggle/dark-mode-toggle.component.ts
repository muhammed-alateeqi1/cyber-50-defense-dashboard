// import { Component } from '@angular/core';

// @Component({
//   selector: 'app-dark-mode-toggle',
//   standalone: true,
//   template: `
//     <button disabled
//       (click)="toggle()" 
//       class="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm 
//              bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200
//              hover:bg-gray-50 dark:hover:bg-gray-600 
//              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900">
//       <i class="fas {{ isDark ? 'fa-sun' : 'fa-moon' }} mr-2"></i>
//       {{ isDark ? 'Light' : 'Dark' }} Mode
//     </button>
//   `
// })
// export class DarkModeToggleComponent {
//   isDark = false;

//   constructor() {
//     const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
//     const saved = localStorage.getItem('theme');
    
//     if (saved === 'dark' || (!saved && systemPrefersDark)) {
//       this.isDark = true;
//       document.documentElement.classList.add('dark');
//     }
//   }

//   toggle() {
//     this.isDark = !this.isDark;
//     const root = document.documentElement;
    
//     if (this.isDark) {
//       root.classList.add('dark');
//       localStorage.setItem('theme', 'dark');
//     } else {
//       root.classList.remove('dark');
//       localStorage.setItem('theme', 'light');
//     }
//   }
// }