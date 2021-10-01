const template = document.createElement("template");
template.innerHTML = `
<nav id="sidebarMenu" class="col-md-3 col-lg-2 d-md-block bg-light sidebar collapse">
  <div class="position-sticky pt-3">
    <ul class="nav flex-column">
      <li class="nav-item">
        <a class="nav-link active" aria-current="page" href="#">
          <span data-feather="home"></span>
          Dashboard
        </a>
      </li>
     

    </ul>

   
  </div>
</nav>
`;

class Menu extends HTMLElement {

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.appendChild(template.content.cloneNode(true));
  }

}

window.customElements.define("cyberbull-menu", Menu);