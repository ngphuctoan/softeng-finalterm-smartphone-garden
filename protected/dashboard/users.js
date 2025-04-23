(() => {
    const rowsPerPage = 7
    let currentPage = 1;
  
    // DOM nodes
    const tbody = document.getElementById('userTableBody');
    const pagination = document.getElementById('userPagination');
    const userModalEl = document.getElementById('userModal');
    const deleteModalEl = document.getElementById('deleteUserModal');
    
    if (!tbody || !pagination) {
      console.error('Không tìm thấy #userTableBody hoặc #userPagination trong DOM');
      return;
    }
    
    // render một trang
    function renderPage(page) {
      const start = (page - 1) * rowsPerPage;
      const end = start + rowsPerPage;
      const pageItems = usersData.slice(start, end);
        
      tbody.innerHTML = '';
      pageItems.forEach(user => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${user.name}</td>
          <td>${user.email}</td>
          <td class="text-center">${user.roleName}</td>
          <td class="text-center">
            <div class="d-flex justify-content-center gap-2">
              <button
                class="btn btn-sm btn-outline-dark rounded-pill" type="button" data-bs-toggle="modal" data-bs-target="#userModal" data-user='${JSON.stringify(user)}'>
                <iconify-icon icon="mynaui:pencil"></iconify-icon>
                <span class="ms-1">Edit</span>
              </button>
              <button
                class="btn btn-sm btn-outline-danger rounded-pill"
                type="button"
                data-bs-toggle="modal"
                data-bs-target="#deleteUserModal"
                data-user='${JSON.stringify(user)}'
              >
                <iconify-icon icon="mynaui:trash"></iconify-icon>
                <span class="ms-1">Delete</span>
              </button>
            </div>
          </td>
        `;
        tbody.appendChild(tr);
      });
    }
  
    // render controls pagination
    function createPageItem(label, page, disabled = false, isActive = false) {
        const li = document.createElement('li');
        li.classList.add('page-item');
        if (disabled)     li.classList.add('disabled');
        if (isActive)     li.classList.add('active');
        
        const a = document.createElement('a');
        a.classList.add('page-link');
        a.href = '#';
        a.textContent = label;
        
        // Tô màu link active/disabled bằng utility classes
        if (isActive)     a.classList.add('bg-secondary', 'text-white');
        else if (disabled) a.classList.add('text-muted');
        
        li.appendChild(a);
        if (!disabled) {
          li.addEventListener('click', e => {
            e.preventDefault();
            currentPage = page;
            renderPage(currentPage);
            renderPagination();
          });
        }
        return li;
      }
      
      function renderPagination() {
        const pageCount = Math.ceil(usersData.length / rowsPerPage);
        pagination.innerHTML = '';
      
        // First / Prev
        pagination.appendChild(createPageItem('First Page', 1,        currentPage === 1));
        pagination.appendChild(createPageItem('Previous', currentPage - 1, currentPage === 1));
      
        // Các trang
        for (let i = 1; i <= pageCount; i++) {
          pagination.appendChild(createPageItem(i, i, false, i === currentPage));
        }
      
        // Next / Last
        pagination.appendChild(createPageItem('Next', currentPage + 1, currentPage === pageCount));
        pagination.appendChild(createPageItem('Last Page', pageCount,        currentPage === pageCount));
      }
      
  
    // khi modal Edit show thì fill form
    function onShowEdit(event) {
      const user = JSON.parse(event.relatedTarget.dataset.user);
      const form = document.getElementById('userForm');
  
      form.action = `/dashboard/users/update?id=${user.id}`;
      form.userId.value    = user.id;
      form.name.value      = user.name;
      form.email.value     = user.email;
  
      Array.from(form.role.options).forEach(opt => {
        opt.selected = opt.value === user.roleName;
      });
      form.role.focus();
    }
  
    // khi modal Delete show thì fill confirm dialog
    function onShowDelete(event) {
      const user = JSON.parse(event.relatedTarget.dataset.user);
      document.getElementById('deleteUserId').value      = user.id;
      document.getElementById('deleteUserName').textContent  = user.name;
      document.getElementById('deleteUserEmail').textContent = user.email;
      document.getElementById('deleteUserRole').textContent  = user.roleName;
      document.getElementById('deleteForm').action = `/dashboard/users/delete?id=${user.id}`;
    }
    
    // init
    document.addEventListener('DOMContentLoaded', () => {
      renderPage(currentPage);
      renderPagination();
      userModalEl?.addEventListener('show.bs.modal', onShowEdit);
      deleteModalEl?.addEventListener('show.bs.modal', onShowDelete);
    });
  })();
  