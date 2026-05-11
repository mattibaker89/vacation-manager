<template>
  <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
    <div class="container">
      <span class="navbar-brand fw-bold">Vacation Manager</span>
      <div class="navbar-nav ms-auto">
        <RouterLink class="nav-link" active-class="active" to="/requester">
          My Requests
        </RouterLink>
        <RouterLink class="nav-link" active-class="active" to="/validator">
          Validator Dashboard
        </RouterLink>
      </div>
    </div>
  </nav>
  <div class="container py-4">
    <RouterView />
  </div>
</template>
