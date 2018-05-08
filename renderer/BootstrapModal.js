let counter = 0;

module.exports = class BootstrapModal {

    constructor(config = {}) {
        this.id = "cm-bootstrap-modal-" + counter++;
        this.config = {
            dialogCss: "", // Additional css for ".modal-dialog", like "modal-lg" or "modal-sm"
            modalCss: "fade", // Additional css for ".modal"
            options: null // The Bootstrap modal options as described here: https://getbootstrap.com/docs/4.0/components/modal/#options
        };
        Object.assign(this.config, config);
    }

    createContainerElement() {
        this.element = document.createElement("div");
        this.element.id = this.id;
        this.element.setAttribute("class", `modal ${this.config.modalCss}`);
        this.element.setAttribute("tabindex", "-1");
        this.element.setAttribute("role", "dialog");
        this.element.setAttribute("aria-labelledby", this.id);
        this.element.innerHTML = `<div class="modal-dialog ${this.config.dialogCss}" role="document">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title"></h5>
                            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <form>
                            <div class="modal-body"></div>
                            <div class="modal-footer"></div>
                        </form>
                    </div>
                </div>`;
        document.body.appendChild(this.element);
        this.titleElement = this.element.querySelector(".modal-title");
        this.bodyElement = this.element.querySelector(".modal-body");
        this.footerElement = this.element.querySelector(".modal-footer");
        $(this.element).on('hidden.bs.modal', () => {
            this.dispose();
            this.element = null;
        });
        this.postCreate();
    }

    postCreate() {
        // overwrite in subclasses
    }

    show(title = null, body = null, footer = null) {
        if (!this.element) {
            this.createContainerElement();
            if (this.config.options) {
                $(this.element).modal(this.config.options);
            } else {
                $(this.element).modal();
            }
        } else {
            $(this.element).modal('show');
        }
        if (title) {
            $(this.titleElement).show();
            this.titleElement.innerHTML = title;
        } else {
            $(this.titleElement).hide();
        }
        if (body) {
            $(this.bodyElement).show();
            this.bodyElement.innerHTML = body;
        } else {
            $(this.bodyElement).hide();
        }
        if (footer) {
            $(this.footerElement).show();
            this.footerElement.innerHTML = footer;
        } else {
            $(this.footerElement).hide();
        }
    }

    hide() {
        $(this.element).modal('hide');
    }

    dispose() {
        $(this.element).modal('dispose');
        document.body.removeChild(this.element);
    }

}