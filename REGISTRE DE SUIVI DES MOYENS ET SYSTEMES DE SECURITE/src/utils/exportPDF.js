export function exportToPDF(element, filename) {
  if (!element) {
    console.error('PDF export: element not found');
    return;
  }
  window.print();
}
