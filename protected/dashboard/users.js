(() => {
  const rowsPerPage = 6;
  let currentPage = 1;
  const maxVisible = 5;
  // DOM nodes
  const tbody = document.getElementById("userTableBody");
  const pagination = document.getElementById("userPagination");
  const userModalEl = document.getElementById("userModal");
  const deleteModalEl = document.getElementById("deleteUserModal");

  const allData = usersData;
  let filteredData = [...allData];

  //search
  function onSearch(e) {
    const q = e.target.value.trim().toLowerCase();
    if (q.length > 0) {
      filteredData = allData.filter(
        (u) =>
          u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
      );

      if (filteredData.length === 0) {
        tbody.innerHTML = "";
        const tr = document.createElement("tr");
        tr.innerHTML = `<td colspan="4" class="p-3">No data found</td>`;
        tbody.appendChild(tr);
        createWWhiteRegion();
      }
      else {
        tbody.innerHTML = "";
        filteredData.forEach((user) => {
          const tr = document.createElement("tr");
          tr.innerHTML = `
                <td class="pt-3">${user.name}</td>
                <td class="pt-3 d-none d-sm-table-cell">${user.email}</td>
                <td class="text-center pt-3 d-none d-md-table-cell">${user.roleName}</td>
                <td class="text-center">
                  <div class="d-flex justify-content-center gap-2">
                    <button
                      class="btn btn-sm text-secondary rounded-pill" type="button" data-bs-toggle="modal" data-bs-target="#userModal" data-user='${JSON.stringify(
                        user  
                      )}'>
                      <iconify-icon icon="mynaui:pencil"></iconify-icon>
                    </button>
                  </div>
                </td>
              `;
          tbody.appendChild(tr);
        });
      }
    }
    else{
      tbody.innerHTML = "";
      renderPage(currentPage);
      renderPagination(6*50);
    }
  }

  // render một trang
  function renderPage(page) {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    const pageItems = usersData.slice(start, end);
    tbody.innerHTML = "";

    pageItems.forEach((user) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
          <td class="pt-3">${user.name}</td>
          <td class="pt-3 d-none d-sm-table-cell">${user.email}</td>
          <td class="text-center pt-3 d-none d-md-table-cell">${user.roleName}</td>
          <td class="text-center">
            <div class="d-flex justify-content-center gap-2">
              <button
                class="btn btn-sm text-secondary rounded-pill" type="button" data-bs-toggle="modal" data-bs-target="#userModal" data-user='${JSON.stringify(
                  user
                )}'>
                <iconify-icon icon="mynaui:pencil"></iconify-icon>
              </button>
            </div>
          </td>
        `;
      tbody.appendChild(tr);
    });

    if (pageItems.length < rowsPerPage) {
      const whiteRegionHeight = (rowsPerPage - pageItems.length - 1) * 50;
      const tr = document.createElement("tr");
      tr.innerHTML = `<td colspan="4" class="p-3">No more data</td>`;
      tbody.appendChild(tr);
      createWWhiteRegion(whiteRegionHeight);
    } else {
      createWWhiteRegion(0);
    }
  }

  function createWWhiteRegion(height) {
    const div = document.getElementById("whiteRegion");
    div.style.height = height + "px";
    div.style.width = "100%";
    div.style.backgroundColor = "white";
  }

  // render controls pagination
  function createPageItem({
    label,
    page,
    disabled = false,
    active = false,
    icon = null,
    title = "",
  }) {
    const li = document.createElement("li");
    li.className =
      "page-item" + (disabled ? " disabled" : "") + (active ? " active" : "");

    const a = document.createElement("a");
    a.className = "page-link";
    a.href = "#";
    if (icon) {
      a.innerHTML = `<iconify-icon icon="${icon}"></iconify-icon>`;
      a.title = title;
    } else {
      a.textContent = label;
    }
    if (!disabled && !active) {
      li.addEventListener("click", (e) => {
        e.preventDefault();
        currentPage = page;
        renderPage(currentPage);
        renderPagination();
      });
    }
    li.appendChild(a);
    return li;
  }

  function renderPagination() {
    const pageCount = Math.ceil(usersData.length / rowsPerPage);
    pagination.innerHTML = "";

    // First & Prev
    pagination.appendChild(
      createPageItem({
        icon: "mynaui:chevron-double-left",
        page: 1,
        disabled: currentPage === 1,
        title: "First Page",
      })
    );
    pagination.appendChild(
      createPageItem({
        icon: "mynaui:chevron-left",
        page: currentPage - 1,
        disabled: currentPage === 1,
        title: "Previous Page",
      })
    );

    // tính dãy trang cần hiện
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = start + maxVisible - 1;

    if (end > pageCount) {
      end = pageCount;
      start = Math.max(1, end - maxVisible + 1);
    }

    // ellipsis trước
    if (start > 1) {
      pagination.appendChild(createPageItem({ label: "…", disabled: true }));
    }

    // các trang
    for (let i = start; i <= end; i++) {
      pagination.appendChild(
        createPageItem({
          label: i,
          page: i,
          active: i === currentPage,
        })
      );
    }

    // ellipsis sau
    if (end < pageCount) {
      pagination.appendChild(createPageItem({ label: "…", disabled: true }));
    }

    // Next & Last
    pagination.appendChild(
      createPageItem({
        icon: "mynaui:chevron-right",
        page: currentPage + 1,
        disabled: currentPage === pageCount,
        title: "Next Page",
      })
    );
    pagination.appendChild(
      createPageItem({
        icon: "mynaui:chevron-double-right",
        page: pageCount,
        disabled: currentPage === pageCount,
        title: "Last Page",
      })
    );
  }

  // khi modal Edit show thì fill form
  function onShowEdit(event) {
    const user = JSON.parse(event.relatedTarget.dataset.user);
    const form = document.getElementById("userForm");

    
    form.userId.value = user.id;
    form.name.value = user.name;
    form.email.value = user.email;

    Array.from(form.role.options).forEach((opt) => {
      opt.selected = opt.value === user.roleName;
    });
    form.role.focus();

  }

  // init
  document.addEventListener("DOMContentLoaded", () => {
    const searchEl = document.getElementById("searchUser");
    searchEl.addEventListener("input", onSearch);
    renderPage(currentPage);
    renderPagination();
    userModalEl?.addEventListener("show.bs.modal", onShowEdit);
    const form = document.getElementById("userForm");
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const id = form.userId.value;
      const role = form.role.value;
  
      try {
        const res = await fetch(`/dashboard/users/${id}/update-role`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ role })
        });
  
        if (res.redirected) {
          window.location.href = res.url;
        } else if (res.ok) {
          window.location.reload();
        } else {
          const text = await res.text();
          console.error("Update failed:", text);
          alert("Có lỗi xảy ra khi cập nhật role.");
        }
      } catch (err) {
        console.error(err);
        alert("Không thể kết nối đến server.");
      }
    });
  });
})();
