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
                            <div class="input-group mb-3">
                                <input type="text" class="form-control" id="userSearch" 
                                       placeholder="Search users..." 
                                       onkeyup="filterUsers(this.value)">
                            </div>
                            <ul class="list-group" id="usersList">
                                <!-- Users will be loaded here dynamically -->
                                <li class="text-center">
                                    <div class="spinner-border text-warning" role="status">
                                        <span class="visually-hidden">Loading...</span>
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

        // Add this after creating the modal
        document.getElementById("gameModal").addEventListener("shown.bs.modal", () => {
            populateUsers();
        });

        // Populate users when the modal is shown
        populateUsers();
      });
    });

// Add function to fetch messages for a conversation
async function fetchMessages(conversationId) {
    try {
        const response = await fetch(`http://127.0.0.1:8000/conversations/${conversationId}/messages/`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('access')}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch messages');
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching messages:', error);
        return [];
    }
}

// Update the openChatRoom function's modal header
async function openChatRoom(userId, userName, userAvatar) {
    // Check if chat room already exists
    const existingChat = document.getElementById(`chatRoom-${userId}`);
    if (existingChat) {
        return; // Chat already open
    }

    const chatRoomHTML = `
        <div class="modal chat-room" id="chatRoom-${userId}" tabindex="-1">
            <div class="modal-dialog modal-dialog-scrollable position-fixed bottom-0 end-0 mb-3 me-3" style="width: 300px;">
                <div class="modal-content border border-warning">
                    <div class="modal-header bg-warning py-2">
                        <div class="d-flex align-items-center flex-grow-1">
                            <img src="${userAvatar}" class="rounded-circle me-2" style="width: 30px; height: 30px;">
                            <h6 class="modal-title mb-0">${userName}</h6>
                        </div>
                        <div class="dropdown me-2">
                            <button class="btn btn-sm btn-warning" data-bs-toggle="dropdown">
                                <i class="bi bi-three-dots-vertical"></i>
                            </button>
                            <ul class="dropdown-menu dropdown-menu-end">
                                <li><button class="dropdown-item text-danger" 
                                    onclick="deleteConversation('${userId}')">
                                    <i class="bi bi-trash"></i> Delete Conversation
                                </button></li>
                            </ul>
                        </div>
                        <button type="button" class="btn btn-sm btn-warning me-1" 
                                onclick="minimizeChatRoom('${userId}')">
                            <i class="bi bi-dash"></i>
                        </button>
                        <button type="button" class="btn-close" 
                                onclick="closeChatRoom('${userId}')">
                        </button>
                    </div>
                    <div class="modal-body bg-light" style="height: 300px; overflow-y: auto;">
                        <div id="chatMessages-${userId}" class="d-flex flex-column gap-2">
                            <div class="text-center">
                                <div class="spinner-border text-warning" role="status">
                                    <span class="visually-hidden">Loading messages...</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="input-group">
                        <input type="text" 
                            class="form-control message-input" 
                            id="messageInput-${userId}" 
                            placeholder="Type a message...">
                        <button class="btn btn-warning send-message" 
                            type="button" 
                            data-user-id="${userId}">
                            <i class="bi bi-send"></i>
                        </button>
                    </div>
                    </div>
                </div>
            </div>
        </div>`;

    // Add chat room to the document
    const chatContainer = document.createElement('div');
    chatContainer.innerHTML = chatRoomHTML;
    document.body.appendChild(chatContainer);

    // Show chat room
    const chatRoom = new bootstrap.Modal(document.getElementById(`chatRoom-${userId}`), {
        backdrop: false
    });
    chatRoom.show();

    // Fetch and display messages
    const messages = await fetchMessages(userId);
    const messagesContainer = document.getElementById(`chatMessages-${userId}`);
    const currentUserId = JSON.parse(localStorage.getItem('user'))?.id;

    if (messages.length === 0) {
        messagesContainer.innerHTML = `
            <div class="text-center text-muted">
                <small>No messages yet. Start the conversation!</small>
            </div>`;
    } else {
        messagesContainer.innerHTML = messages.map(message => `
            <div class="${message.sender === currentUserId ? 'sent-message text-end' : 'received-message'}">
                <small class="text-muted">
                    ${message.sender === currentUserId ? 'You' : userName}
                </small>
                <div class="${message.sender === currentUserId ? 'bg-warning' : 'bg-white'} rounded p-2 shadow-sm d-inline-block">
                    ${message.content}
                </div>
                <small class="text-muted d-block">
                    ${new Date(message.timestamp).toLocaleTimeString()}
                </small>
            </div>
        `).join('');

        // Scroll to bottom
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
}

async function sendMessage(userId) {
    const input = document.getElementById(`messageInput-${userId}`);
    const message = input.value.trim();
    
    if (!message) return;
    
    try {
        const response = await fetch(`http://127.0.0.1:8000/conversations/${userId}/messages/`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('access')}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ content: message })
        });

        if (!response.ok) {
            throw new Error('Failed to send message');
        }

        const messageData = await response.json();
        const messagesContainer = document.getElementById(`chatMessages-${userId}`);
        
        const messageHTML = `
            <div class="sent-message text-end">
                <small class="text-muted">You</small>
                <div class="bg-warning rounded p-2 shadow-sm d-inline-block">
                    ${messageData.content}
                </div>
                <small class="text-muted d-block">
                    ${new Date(messageData.timestamp).toLocaleTimeString()}
                </small>
            </div>`;
        
        messagesContainer.insertAdjacentHTML('beforeend', messageHTML);
        input.value = '';
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        await updateConversationsList();
    } catch (error) {
        console.error('Error sending message:', error);
        alert('Failed to send message');
    }
}

// Add event listeners after creating chat room
document.addEventListener('click', function(e) {
    if (e.target.closest('.send-message')) {
        e.preventDefault();
        const userId = e.target.closest('.send-message').dataset.userId;
        sendMessage(userId);
    }
});

document.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && e.target.classList.contains('message-input')) {
        e.preventDefault();
        const userId = e.target.id.replace('messageInput-', '');
        sendMessage(userId);
    }
});

// Add this function to update conversations list
async function updateConversationsList() {
    try {
        const users = await fetchUsers();
        const usersList = document.getElementById('usersList');
        
        if (usersList) {
            usersList.innerHTML = users.map(user => `
                <li id="chat-user-${user.id}" 
                    class="list-group-item d-flex align-items-center">
                    <img src="${user.profile_picture || 'https://via.placeholder.com/40'}" 
                         class="rounded-circle me-2" 
                         style="width: 40px; height: 40px;"
                         alt="${user.firstname}'s avatar"
                         onerror="this.src='https://via.placeholder.com/40'">
                    <div class="flex-grow-1">
                        <strong>${user.firstname} ${user.lastname}</strong>
                        ${user.last_message ? 
                            `<br><small class="text-muted">${user.last_message}</small>` : 
                            ''}
                    </div>
                    <div class="d-flex align-items-center">
                        ${user.unread_count ? 
                            `<span class="badge bg-danger rounded-pill me-2">
                                ${user.unread_count}
                            </span>` : 
                            ''}
                        <button class="btn btn-sm btn-warning" 
                                onclick="openChatRoom('${user.id}', '${user.firstname} ${user.lastname}', '${user.profile_picture || 'https://via.placeholder.com/40'}')">
                            Chat
                        </button>
                    </div>
                </li>
            `).join('');
        }
    } catch (error) {
        console.error('Error updating conversations list:', error);
    }
}

function minimizeChatRoom(userId) {
    const chatBody = document.querySelector(`#chatRoom-${userId} .modal-body`);
    const chatFooter = document.querySelector(`#chatRoom-${userId} .modal-footer`);
    
    chatBody.classList.toggle('d-none');
    chatFooter.classList.toggle('d-none');
}

function closeChatRoom(userId) {
    const chatRoom = document.getElementById(`chatRoom-${userId}`);
    const modal = bootstrap.Modal.getInstance(chatRoom);
    modal.hide();
    setTimeout(() => chatRoom.remove(), 200);
}

// Add required styles
const chatStyles = `
    .chat-room {
        pointer-events: auto;
    }
    .received-message {
        max-width: 80%;
        margin-right: auto;
    }
    .sent-message {
        max-width: 80%;
        margin-left: auto;
    }
    .modal-backdrop {
        display: none;
    }
`;

const styleSheet = document.createElement('style');
styleSheet.textContent = chatStyles;
document.head.appendChild(styleSheet);

// Add this function to fetch users
async function fetchUsers() {
    try {
        // Fetch both conversations and users data concurrently
        const [conversationsResponse, usersResponse] = await Promise.all([
            fetch('http://127.0.0.1:8000/conversations/', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access')}`
                }
            }),
            fetch('http://127.0.0.1:8000/users/', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access')}`
                }
            })
        ]);

        if (!conversationsResponse.ok || !usersResponse.ok) {
            throw new Error('Failed to fetch data');
        }

        const conversations = await conversationsResponse.json();
        const allUsers = await usersResponse.json();

        // Get current user ID
        const currentUserId = JSON.parse(localStorage.getItem('user'))?.id;

        // Combine conversations with user details
        const users = conversations.map(conversation => {
            // Find other participant's ID
            const otherParticipantId = conversation.participants
                .find(id => id !== currentUserId);
            
            // Get other participant's details from users data
            const userDetails = allUsers.find(u => u.id === otherParticipantId);

            // Return only necessary data
            return {
                id: conversation.id,
                firstname: userDetails?.firstname || 'Unknown',
                lastname: userDetails?.lastname || 'User',
                profile_picture: userDetails?.profile_picture || null,
                last_message: conversation.last_message?.content || '',
                unread_count: conversation.unread_count || 0,
                user_id: otherParticipantId // Store actual user ID for future use
            };
        });

        return users;
    } catch (error) {
        console.error('Error fetching data:', error);
        return [];
    }
}

// Update populateUsers function to use the combined data
async function populateUsers() {
    const usersList = document.getElementById('usersList');
    try {
        usersList.innerHTML = `
            <li class="text-center">
                <div class="spinner-border text-warning" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
            </li>`;

        const users = await fetchUsers();
        
        if (!users || users.length === 0) {
            usersList.innerHTML = '<li class="list-group-item">No conversations found</li>';
            return;
        }

        usersList.innerHTML = users.map(user => `
            <li id="chat-user-${user.id}" 
                class="list-group-item d-flex align-items-center">
                <img src="${user.profile_picture || 'https://via.placeholder.com/40'}" 
                     class="rounded-circle me-2" 
                     style="width: 40px; height: 40px;"
                     alt="${user.firstname}'s avatar"
                     onerror="this.src='https://via.placeholder.com/40'">
                <div class="flex-grow-1">
                    <strong>${user.firstname} ${user.lastname}</strong>
                    ${user.last_message ? 
                        `<br><small class="text-muted">${user.last_message}</small>` : 
                        ''}
                </div>
                <div class="d-flex align-items-center">
                    ${user.unread_count ? 
                        `<span class="badge bg-danger rounded-pill me-2">
                            ${user.unread_count}
                        </span>` : 
                        ''}
                    <button class="btn btn-sm btn-warning" 
                            onclick="openChatRoom('${user.id}', '${user.firstname} ${user.lastname}', '${user.profile_picture || 'https://via.placeholder.com/40'}')">
                        Chat
                    </button>
                </div>
            </li>
        `).join('');
    } catch (error) {
        console.error('Error populating users:', error);
        usersList.innerHTML = '<li class="list-group-item text-danger">Error loading conversations</li>';
    }
}

// Add search filter function
function filterUsers(searchTerm) {
    const usersList = document.getElementById('usersList');
    const items = usersList.getElementsByTagName('li');
    
    for (let item of items) {
        const userName = item.querySelector('strong')?.textContent || '';
        if (userName.toLowerCase().includes(searchTerm.toLowerCase())) {
            item.style.display = '';
        } else {
            item.style.display = 'none';
        }
    }
}

// Add delete conversation function
async function deleteConversation(userId) {
    if (confirm('Are you sure you want to delete this conversation?')) {
        try {
            // Here you would typically call your API to delete the conversation
            // await fetch(`/api/conversations/${userId}`, {
            //     method: 'DELETE',
            //     headers: {
            //         'Authorization': `Bearer ${localStorage.getItem('access_token')}`
            //     }
            // });

            // Close the chat room
            closeChatRoom(userId);

            // Show success message
            const toast = `
                <div class="toast-container position-fixed bottom-0 start-50 translate-middle-x mb-4">
                    <div class="toast bg-success text-white" role="alert">
                        <div class="toast-body">
                            Conversation deleted successfully
                        </div>
                    </div>
                </div>`;
            document.body.insertAdjacentHTML('beforeend', toast);
            const toastEl = document.querySelector('.toast');
            const bsToast = new bootstrap.Toast(toastEl, { delay: 3000 });
            bsToast.show();
            
            // Remove toast after it's hidden
            toastEl.addEventListener('hidden.bs.toast', () => {
                toastEl.remove();
            });

        } catch (error) {
            console.error('Error deleting conversation:', error);
            alert('Failed to delete conversation');
        }
    }
}

// Add debounced search function
async function searchUsers(searchTerm) {
    try {
        const response = await fetch(`http://127.0.0.1:8000/users/?search=${encodeURIComponent(searchTerm)}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('access')}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch users');
        }

        const users = await response.json();
        displaySearchResults(users);
    } catch (error) {
        console.error('Error searching users:', error);
    }
}

// Add function to display search results
function displaySearchResults(users) {
    const usersList = document.getElementById('usersList');
    
    if (!users || users.length === 0) {
        usersList.innerHTML = '<li class="list-group-item">No users found</li>';
        return;
    }

    usersList.innerHTML = users.map(user => `
        <li class="list-group-item d-flex align-items-center">
            <img src="${user.profile_picture || 'https://via.placeholder.com/40'}" 
                 class="rounded-circle me-2" 
                 style="width: 40px; height: 40px;"
                 alt="${user.firstname}'s avatar"
                 onerror="this.src='https://via.placeholder.com/40'">
            <div class="flex-grow-1">
                <strong>${user.firstname} ${user.lastname}</strong>
                <br>
                <small class="text-muted">${user.email || ''}</small>
            </div>
            <button class="btn btn-sm btn-warning" 
                    onclick="startNewConversation(${user.id}, '${user.firstname} ${user.lastname}', '${user.profile_picture || 'https://via.placeholder.com/40'}')">
                Message
            </button>
        </li>
    `).join('');
}

// Add function to start a new conversation
async function startNewConversation(userId, userName, userAvatar) {
    try {
        // Create new conversation
        const response = await fetch('http://127.0.0.1:8000/conversations/', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('access')}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                participant_id: userId
            })
        });

        if (!response.ok) {
            throw new Error('Failed to create conversation');
        }

        const conversation = await response.json();
        
        // Open chat room with new conversation
        openChatRoom(conversation.id, userName, userAvatar);
        
        // Update conversations list
        await updateConversationsList();
    } catch (error) {
        console.error('Error starting conversation:', error);
        alert('Failed to start conversation');
    }
}

// Update the search input to use debounce
function debounce(func, wait) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

// Update the search input in the modal HTML
const searchInput = `
    <div class="input-group mb-3">
        <input type="text" 
               class="form-control" 
               id="userSearch" 
               placeholder="Search users..."
               autocomplete="off">
        <span class="input-group-text">
            <i class="bi bi-search"></i>
        </span>
    </div>
`;

// Add event listener for search input
document.addEventListener('DOMContentLoaded', () => {
    const debouncedSearch = debounce((searchTerm) => {
        if (searchTerm.length >= 2) {
            searchUsers(searchTerm);
        } else {
            populateUsers(); // Show existing conversations when search is cleared
        }
    }, 300);

    document.body.addEventListener('input', (e) => {
        if (e.target && e.target.id === 'userSearch') {
            debouncedSearch(e.target.value);
        }
    });
});
