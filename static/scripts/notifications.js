document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("openGameModal").addEventListener("click", async (e) => {
        e.preventDefault();
    
        if (!document.getElementById("bootstrap-css")) {
          const bootstrapCSS = document.createElement("link");
          bootstrapCSS.rel = "stylesheet";
          bootstrapCSS.href = "https://cdn.jsdelivr.net/npm/bootstrap@5.3.5/dist/css/bootstrap.min.css";
          bootstrapCSS.integrity = "sha384-SgOJa3DmI69IUzQ2PVdRZhwQ+dy64/BUtbMJw1MZ8t5HZApcHrRKUc4W0kG879m7";
          bootstrapCSS.crossOrigin = "anonymous";
          bootstrapCSS.id = "bootstrap-css";
          document.head.appendChild(bootstrapCSS);
        }
    
        if (!document.getElementById("bootstrap-js")) {
          const bootstrapJS = document.createElement("script");
          bootstrapJS.src = "https://cdn.jsdelivr.net/npm/bootstrap@5.3.5/dist/js/bootstrap.bundle.min.js";
          bootstrapJS.integrity = "sha384-k6d4wzSIapyDyv1kpU366/PK5hCdSbCRGRCMv+eplOQJWyd1fbcAu9OCUj5zNLiq";
          bootstrapJS.crossOrigin = "anonymous";
          bootstrapJS.id = "bootstrap-js";
          document.body.appendChild(bootstrapJS);
    
          await new Promise(resolve => bootstrapJS.onload = resolve);
        }
    
        if (!document.getElementById("gameModal")) {
          const modalHTML = `
          <!-- Modal -->
          <div class="modal" id="gameModal" tabindex="-1">
            <div class="modal-dialog modal-lg mx-auto mt-3">
                <div class="modal-content">
                    <!-- sticky headers -->
                    <div class="modal-header sticky-tabs bg-warning p-2">
                        <div class="d-flex w-100 align-items-center justify-content-between">
                        <ul class="nav nav-tabs flex-nowrap nav-tabs-scrollable w-100" id="gameTabs" role="tablist">
                            <li class="nav-item" role="presentation">
                                <button class="nav-link active" data-bs-toggle="tab" data-bs-target="#messages" type="button" role="tab">Messages <span><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-chat-left-dots-fill" viewBox="0 0 16 16">
                                    <path d="M0 2a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4.414a1 1 0 0 0-.707.293L.854 15.146A.5.5 0 0 1 0 14.793zm5 4a1 1 0 1 0-2 0 1 1 0 0 0 2 0m4 0a1 1 0 1 0-2 0 1 1 0 0 0 2 0m3 1a1 1 0 1 0 0-2 1 1 0 0 0 0 2"/>
                                  </svg></span></button>
                            </li>
                            <li class="nav-item" role="presentation">
                                <button class="nav-link" data-bs-toggle="tab" data-bs-target="#invitation" type="button" role="tab">Invitation <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-bell-fill" viewBox="0 0 16 16">
                                    <path d="M8 16a2 2 0 0 0 2-2H6a2 2 0 0 0 2 2m.995-14.901a1 1 0 1 0-1.99 0A5 5 0 0 0 3 6c0 1.098-.5 6-2 7h14c-1.5-1-2-5.902-2-7 0-2.42-1.72-4.44-4.005-4.901"/>
                                  </svg></button>
                            </li>
                            <li class="nav-item" role="presentation">
                                <button class="nav-link" data-bs-toggle="tab" data-bs-target="#updates" type="button" role="tab">Updates <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-person-circle" viewBox="0 0 16 16">
                                    <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0"/>
                                    <path fill-rule="evenodd" d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8m8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1"/>
                                  </svg></button>
                            </li>
                        </ul>
                        </div>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
    
                    <div class="modal-body tab-content" style="max-height: 70vh; overflow-y: auto;">
                        <div class="tab-pane fade show active" id="messages" role="tabpanel">
                            <ul class="list-group">
                                <li class="list-group-item d-flex align-items-center">
                                    <img img src="/static/img/Jhonny.jpg" class="rounded-circle me-2" style="width: 40px; height: 40px;">
                                    <div class="flex-grow-1">
                                        <strong>LeBrong James</strong><br>sanka maya tol
                                    </div>
                                    <span class="badge bg-danger rounded-pill">3</span>
                                </li>
                                <li class="list-group-item d-flex align-items-center">
                                    <img src="https://via.placeholder.com/40" class="rounded-circle me-2">
                                    <div class="flex-grow-1">
                                        <strong>Kai Sotto</strong><br>Tara na tol
                                    </div>
                                </li>
                            </ul>
                        </div>
    
                        <div class="tab-pane fade" id="invitation" role="tabpanel">
                            <div class="mb-3 d-flex justify-content-between align-items-center">
                                <span><h6 class="mb-0">Mahi League</h6>
                                    <p>December 13, 10pm</p>
                                </span>
                                <button class="btn btn-warning btn-sm">See Invite</button>
                            </div>
                            <div class="mb-3 d-flex justify-content-between align-items-center">
                                <span>
                                    <h6 class="mb-0">Liga ng mga Bida</h6>
                                    <p>November 19, 7pm</p>
                                </span>
                                <button class="btn btn-warning btn-sm">See Invite</button>
                            </div>
                            <div class="mb-3 d-flex justify-content-between align-items-center flex-wrap">
                                <div>
                                    <h6 class="mb-0">Ito ang Liga</h6>
                                    <p>April 1, 7pm</p>
                                    <p><strong>Pallumo Court, Brgy. Tiniguiban</strong></p>
                                </div>
                                <img src="/static/img/palumco.jpg" class="img-fluid mb-2" alt="Court Image">
                                <button class="btn btn-warning btn-sm">See Details</button>
                            </div>
                        </div>
    
                        <div class="tab-pane fade" id="updates" role="tabpanel">
                            <div class="mb-3 d-flex justify-content-between align-items-center">
                                <img src="https://via.placeholder.com/40" class="rounded-circle me-2">
                                <span class="flex-grow-1">
                                    <h6 class="mb-0">Mahni Gear</h6>
                                    <p class="text-muted">Followed you</p>
                                </span>
                                <button class="btn btn-warning btn-sm">See Details</button>
                            </div>
                            <div class="mb-3 d-flex justify-content-between align-items-center">
                                <img src="https://via.placeholder.com/40" class="rounded-circle me-2">
                                <span class="flex-grow-1">
                                    <h6 class="mb-0">Kai Sutto</h6>
                                    <p class="text-muted">Followed you</p>
                                </span>
                                <button class="btn btn-warning btn-sm">See Details</button>
                            </div>
                            <div class="card">
                                <div class="card-body d-flex">
                                    <img src="https://via.placeholder.com/60" class="rounded-circle me-3">
                                    <div>
                                        <h6>Lance Nah Bro</h6>
                                        <p class="mb-1">Position: <strong>Point Guard</strong></p>
                                        <p>Skill Level: ⭐⭐⭐⭐☆</p>
                                        <p>Recent Matches:<br>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trophy-fill" viewBox="0 0 16 16">
      <path d="M2.5.5A.5.5 0 0 1 3 0h10a.5.5 0 0 1 .5.5q0 .807-.034 1.536a3 3 0 1 1-1.133 5.89c-.79 1.865-1.878 2.777-2.833 3.011v2.173l1.425.356c.194.048.377.135.537.255L13.3 15.1a.5.5 0 0 1-.3.9H3a.5.5 0 0 1-.3-.9l1.838-1.379c.16-.12.343-.207.537-.255L6.5 13.11v-2.173c-.955-.234-2.043-1.146-2.833-3.012a3 3 0 1 1-1.132-5.89A33 33 0 0 1 2.5.5m.099 2.54a2 2 0 0 0 .72 3.935c-.333-1.05-.588-2.346-.72-3.935m10.083 3.935a2 2 0 0 0 .72-3.935c-.133 1.59-.388 2.885-.72 3.935"/>
    </svg> February 5, 2025 - Win<br>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trophy-fill" viewBox="0 0 16 16">
      <path d="M2.5.5A.5.5 0 0 1 3 0h10a.5.5 0 0 1 .5.5q0 .807-.034 1.536a3 3 0 1 1-1.133 5.89c-.79 1.865-1.878 2.777-2.833 3.011v2.173l1.425.356c.194.048.377.135.537.255L13.3 15.1a.5.5 0 0 1-.3.9H3a.5.5 0 0 1-.3-.9l1.838-1.379c.16-.12.343-.207.537-.255L6.5 13.11v-2.173c-.955-.234-2.043-1.146-2.833-3.012a3 3 0 1 1-1.132-5.89A33 33 0 0 1 2.5.5m.099 2.54a2 2 0 0 0 .72 3.935c-.333-1.05-.588-2.346-.72-3.935m10.083 3.935a2 2 0 0 0 .72-3.935c-.133 1.59-.388 2.885-.72 3.935"/>
    </svg> January 7, 2025 - Win<br>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trophy-fill" viewBox="0 0 16 16">
      <path d="M2.5.5A.5.5 0 0 1 3 0h10a.5.5 0 0 1 .5.5q0 .807-.034 1.536a3 3 0 1 1-1.133 5.89c-.79 1.865-1.878 2.777-2.833 3.011v2.173l1.425.356c.194.048.377.135.537.255L13.3 15.1a.5.5 0 0 1-.3.9H3a.5.5 0 0 1-.3-.9l1.838-1.379c.16-.12.343-.207.537-.255L6.5 13.11v-2.173c-.955-.234-2.043-1.146-2.833-3.012a3 3 0 1 1-1.132-5.89A33 33 0 0 1 2.5.5m.099 2.54a2 2 0 0 0 .72 3.935c-.333-1.05-.588-2.346-.72-3.935m10.083 3.935a2 2 0 0 0 .72-3.935c-.133 1.59-.388 2.885-.72 3.935"/>
    </svg> December 21, 2024 - Loss
                                        </p>
                                        <button class="btn btn-outline-dark btn-sm">Check Profile</button>
                                        <button class="btn btn-success btn-sm">Follow Back</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
          </div>
          `;
          const container = document.createElement("div");
          container.innerHTML = modalHTML;
          document.body.appendChild(container);
        }
    
        const modal = new bootstrap.Modal(document.getElementById("gameModal"));
        modal.show();
    
        document.getElementById("gameModal").addEventListener("hidden.bs.modal", () => {
          document.getElementById("gameModal")?.remove();
          document.getElementById("bootstrap-css")?.remove();
          document.getElementById("bootstrap-js")?.remove();
        }, { once: true });
      });
    });
  