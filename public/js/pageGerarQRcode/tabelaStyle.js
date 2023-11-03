document.addEventListener("DOMContentLoaded", function() {
  function transformTableForMobile() {
      const headers = Array.from(document.querySelectorAll('#historyTable thead th'));
      const rows = document.querySelectorAll('#historyTable tbody tr');
      
      rows.forEach(row => {
          const cells = row.querySelectorAll('td');
          cells.forEach((cell, index) => {
              const headerText = headers[index] ? headers[index].textContent : '';
              cell.setAttribute('data-label', headerText);
          });
      });
  }

  if(window.innerWidth <= 767) {
      transformTableForMobile();
  }

  window.addEventListener('resize', () => {
      if(window.innerWidth <= 767) {
          transformTableForMobile();
      }
  });
});
