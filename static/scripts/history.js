        const historyData = [
          { label: "MAHI LEAGUE", location: "Palumco", date: "Feb 22, 2025", trophy: "<i class='fas fa-trophy' style='color: #fada39;'></i>", result: "CHAMP" },
          { label: "LIGA NG MGA BIDA", location: "Palumco", date: "Feb 15, 2025", trophy: "<i class='fas fa-trophy' style='color: #fada39;'></i>", result: "CHAMP" },
          { label: "SUPER BOWL", location: "Palumco", date: "Feb 8, 2025", trophy: "<i class='fas fa-times-circle' style='color: red;''></i>", result: "LOSS" },
          { label: "STREETBALL KINGS", location: "Palumco", date: "Jan 30, 2025", trophy: "<i class='fas fa-trophy' style='color: #fada39;'></i>", result: "CHAMP" },
          { label: "TOURNAMENT OF LEGENDS", location: "Palumco", date: "Jan 20, 2025", trophy: "<i class='fas fa-trophy' style='color: #fada39;'></i>", result: "CHAMP" },
          { label: "WEST COAST WARS", location: "Palumco", date: "Jan 10, 2025", trophy: "<i class='fas fa-trophy' style='color: #fada39;'></i>", result: "CHAMP" },
          { label: "EAST COAST ELITES", location: "Palumco", date: "Jan 1, 2025", trophy: "<i class='fas fa-trophy' style='color: #fada39;'></i>", result: "CHAMP" },
          { label: "BASKETBRAWL", location: "Palumco", date: "Dec 20, 2024", trophy: "<i class='fas fa-trophy' style='color: #fada39;'></i>", result: "CHAMP" },
          { label: "WINTER HOOPS", location: "Palumco", date: "Dec 10, 2024", trophy: "<i class='fas fa-trophy' style='color: #fada39;'></i>", result: "CHAMP" },
          { label: "BARRIO CUP", location: "Palumco", date: "Dec 1, 2024", trophy: "<i class='fas fa-trophy' style='color: #fada39;'></i>", result: "CHAMP" },
          { label: "METRO MADNESS", location: "Palumco", date: "Nov 25, 2024", trophy: "<i class='fas fa-trophy' style='color: #fada39;'></i>", result: "CHAMP" },
          { label: "BACKYARD CLASSICS", location: "Palumco", date: "Nov 10, 2024", trophy: "<i class='fas fa-trophy' style='color: #fada39;'></i>", result: "CHAMP" },
          { label: "UPTOWN CHAMPS", location: "Palumco", date: "Oct 30, 2024", trophy: "<i class='fas fa-trophy' style='color: #fada39;'></i>", result: "CHAMP" },
          { label: "RIVERSIDE RUMBLE", location: "Palumco", date: "Oct 15, 2024", trophy: "<i class='fas fa-trophy' style='color: #fada39;'></i>", result: "CHAMP" },
          { label: "HARDCOURT HEROES", location: "Palumco", date: "Oct 1, 2024", trophy: "<i class='fas fa-trophy' style='color: #fada39;'></i>", result: "CHAMP" }
        ];
      
        const container = document.getElementById('containerHistory');
        const loadChunk = 9;
        let loadedCount = 0;
      
        function createHistoryItemMostRecent(entry) {
          const div = document.createElement('div');
          div.className = 'itemHistoryMostRecent';
          div.innerHTML = `
            <div class="left">
              <div class="label">${entry.label}</div>
              <div class="date">${entry.date}</div>
              <div class="location">${entry.location}</div>
            </div>

            <div class="resultStat">
              <div class="trophy">${entry.trophy}</div>
              <div class="result">${entry.result}</div>
            </div>
          `;
          return div;
        }

        function createHistoryItem(entry) {
          const div = document.createElement('div');
          div.className = 'itemHistory';
          div.innerHTML = `
            <div class="left">
              <div class="label">${entry.label}</div>
              <div class="date">${entry.date}</div>
              <div class="location">${entry.location}</div>
            </div>

            <div class="resultStat">
              <div class="trophy">${entry.trophy}</div>
              <div class="result">${entry.result}</div>
            </div>
          `;
          return div;
        }
      
        function loadMoreHistory() {
          const remaining = historyData.length - loadedCount;
          const count = Math.min(loadChunk, remaining);
      
          for (let i = 0; i < count; i++) {
            if (i == 0) {
              const entry = historyData[loadedCount++];
              const item = createHistoryItemMostRecent(entry);
              container.appendChild(item);

            } else {
              const entry = historyData[loadedCount++];
              const item = createHistoryItem(entry);
              container.appendChild(item);
            }

          }
        }
      
        // Initial load
        loadMoreHistory();
      
        // Detect scroll near bottom of window
        window.addEventListener('scroll', () => {
          const scrollTop = window.scrollY;
          const windowHeight = window.innerHeight;
          const docHeight = document.documentElement.scrollHeight;
      
          if (scrollTop + windowHeight >= docHeight - 100) {
            loadMoreHistory();
          }
        });