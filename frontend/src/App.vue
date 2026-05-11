<template>
  <div id="wrapper">
    <nav class="navbar-static-side">
      <span class="sidebar-brand">
        <i class="fa-solid fa-umbrella-beach"></i> Vacation Manager
      </span>
      <ul class="sidebar-nav">
        <li>
          <RouterLink to="/requester">
            <i class="fa-solid fa-paper-plane"></i> My Requests
          </RouterLink>
        </li>
        <li>
          <RouterLink to="/validator">
            <i class="fa-solid fa-chart-line"></i> Dashboard
          </RouterLink>
        </li>
        <li>
          <RouterLink to="/validator/requests">
            <i class="fa-solid fa-list-check"></i> All Requests
          </RouterLink>
        </li>
        <li>
          <RouterLink to="/users">
            <i class="fa-solid fa-users"></i> Users
          </RouterLink>
        </li>
      </ul>
    </nav>

    <div id="page-wrapper">
      <div class="top-navigation">
        <span class="app-title">Vacation Management System</span>
      </div>
      <div class="wrapper-content">
        <RouterView />
      </div>
    </div>
  </div>
</template>
