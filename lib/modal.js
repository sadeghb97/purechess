let modalFilenameKeyupDisable = false

function openModal() {
  const modalTrigger = document.getElementsByClassName('jsModalTrigger');
  const filenameInp = document.getElementById("filename")
  filenameInitListener()

  for(let i = 0; i < modalTrigger.length; i++) {
    modalTrigger[i].onclick = function() {
      const modalWindow = document.getElementById("jsModal");

      setTimeout(() => {
        filenameInp.focus()
      }, 50)

      modalWindow.classList ? modalWindow.classList.add('open') : modalWindow.className += ' ' + 'open';
    }
  }
}

function disableFilenameListeners(){
  modalFilenameKeyupDisable = true
}

function enableFilenameListeners(){
  modalFilenameKeyupDisable = false
}

function filenameInitListener(){
  const filenameInp = document.getElementById("filename")
  filenameInp.addEventListener("keyup", function(event) {
    if (event.key === "Enter") {
      if(!modalFilenameKeyupDisable) submit()
    }
  });
}

function closeModal(){
  /* Get close button */
  const closeButton = document.getElementsByClassName('jsModalClose');
  const closeOverlay = document.getElementsByClassName('jsOverlay');

  for(let i = 0; i < closeButton.length; i++) {
    closeButton[i].onclick = function() {
      const modalWindow = this.parentNode.parentNode;

      modalWindow.classList ? modalWindow.classList.remove('open') : modalWindow.className = modalWindow.className.replace(new RegExp('(^|\\b)' + 'open'.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
    }
  }

  for(let i = 0; i < closeOverlay.length; i++) {
    closeOverlay[i].onclick = function() {
      const modalWindow = this.parentNode;

      modalWindow.classList ? modalWindow.classList.remove('open') : modalWindow.className = modalWindow.className.replace(new RegExp('(^|\\b)' + 'open'.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
    }
  }
}

function onCategoryChange(){
  const cateSelect = document.getElementById("category");

  const fg_fields = document.getElementById("fg_fields")
  const tr_fields = document.getElementById("tr_fields")

  if(cateSelect.value === 'traps'){
    fg_fields.style.display = "none"
    tr_fields.style.display = "block"
  }
  else {
    fg_fields.style.display = "block"
    tr_fields.style.display = "none"
  }
}

function submit(){
  const cateSelect = document.getElementById("category");
  if(cateSelect.value === 'traps') exportGame()
  else save()
}

function ready(fn) {
  if (document.readyState != 'loading'){
    fn();
  } else {
    document.addEventListener('DOMContentLoaded', fn);
  }
}

ready(openModal);
ready(closeModal);
