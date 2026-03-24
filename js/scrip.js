const openBtn = document.getElementById('openSidebar');
const closeBtn = document.getElementById('closeSidebar');
const sidebar = document.getElementById('sidebar');
const overlay = document.getElementById('overlay');

openBtn.onclick = () => {
  sidebar.classList.add('active');
  overlay.classList.add('active');
};

closeBtn.onclick = () => {
  sidebar.classList.remove('active');
  overlay.classList.remove('active');
};

overlay.onclick = () => {
  sidebar.classList.remove('active');
  overlay.classList.remove('active');
};

document.querySelectorAll('.sidebar-toggle').forEach(item => {
  item.addEventListener('click', function(e) {
    e.preventDefault();
    const parent = this.parentElement;
    parent.classList.toggle('active');
  });
});

document.addEventListener("DOMContentLoaded", () => {

    const btn = document.getElementById("backToTop");

    btn.addEventListener("click", () => {

        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;

    });

});