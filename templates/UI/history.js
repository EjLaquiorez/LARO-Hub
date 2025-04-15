        const historyData = [
          { label: "🏆 MAHI LEAGUE", date: "Feb 22, 2025", result: "CHAMP" },
          { label: "🏆 LIGA NG MGA BIDA", date: "Feb 15, 2025", result: "CHAMP" },
          { label: "❌ SUPER BOWL", date: "Feb 8, 2025", result: "LOSS" },
          { label: "🏀 STREETBALL KINGS", date: "Jan 30, 2025", result: "CHAMP" },
          { label: "🏆 TOURNAMENT OF LEGENDS", date: "Jan 20, 2025", result: "CHAMP" },
          { label: "🏆 WEST COAST WARS", date: "Jan 10, 2025", result: "CHAMP" },
          { label: "🏀 EAST COAST ELITES", date: "Jan 1, 2025", result: "CHAMP" },
          { label: "🏆 BASKETBRAWL", date: "Dec 20, 2024", result: "CHAMP" },
          { label: "🏀 WINTER HOOPS", date: "Dec 10, 2024", result: "CHAMP" },
          { label: "🏆 BARRIO CUP", date: "Dec 1, 2024", result: "CHAMP" },
          { label: "🏆 METRO MADNESS", date: "Nov 25, 2024", result: "CHAMP" },
          { label: "🏀 BACKYARD CLASSICS", date: "Nov 10, 2024", result: "CHAMP" },
          { label: "🏆 UPTOWN CHAMPS", date: "Oct 30, 2024", result: "CHAMP" },
          { label: "🏀 RIVERSIDE RUMBLE", date: "Oct 15, 2024", result: "CHAMP" },
          { label: "🏆 HARDCOURT HEROES", date: "Oct 1, 2024", result: "CHAMP" }
        ];
      
        const container = document.getElementById('containerHistory');
        const loadChunk = 3;
        let loadedCount = 0;
      
        function createHistoryItem(entry) {
          const div = document.createElement('div');
          div.className = 'itemHistory';
          div.innerHTML = `
            <div class="left">
              <div class="label">${entry.label}</div>
              <div class="date">${entry.date}</div>
            </div>
            <div class="result">${entry.result}</div>
          `;
          return div;
        }
      
        function loadMoreHistory() {
          const remaining = historyData.length - loadedCount;
          const count = Math.min(loadChunk, remaining);
      
          for (let i = 0; i < count; i++) {
            const entry = historyData[loadedCount++];
            const item = createHistoryItem(entry);
            container.appendChild(item);
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