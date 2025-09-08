(function(){
  const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbwwhZLircbMTTPZDZQwqwcMq9xJhhSyHWnr__5h_SjOYFE-Yic8o3t8xNPOvUC6rHup/exec"; // <--- web app URL from Apps Script
  const SECRET_TOKEN = "PASTE_YOUR_SECRET_TOKEN_IF_USED"; // optional, same as SECRET in Apps Script

  const form = document.getElementById('profilingForm');
  const modalContent = document.getElementById('modalContent');
  const finalBtn = document.getElementById('finalSubmit');
  let previewModalInstance = null;
  let currentData = null;

  // helper: build preview HTML
  function buildPreviewHtml(d) {
    return `
      <div class="container">
        <dl class="row">
          <dt class="col-sm-4">Registered Company Name</dt><dd class="col-sm-8">${d.companyName}</dd>
          <dt class="col-sm-4">Company Address</dt><dd class="col-sm-8">${d.address}</dd>
          <dt class="col-sm-4">Authorized Signatory</dt><dd class="col-sm-8">${d.signatory}</dd>
          <dt class="col-sm-4">Designation</dt><dd class="col-sm-8">${d.designation}</dd>
          <dt class="col-sm-4">Contact Person</dt><dd class="col-sm-8">${d.contactPerson}</dd>
          <dt class="col-sm-4">Contact Number</dt><dd class="col-sm-8">+63 ${d.contactNumber}</dd>
          <dt class="col-sm-4">Email Address</dt><dd class="col-sm-8">${d.email}</dd>
          <dt class="col-sm-4">Nature of Business</dt><dd class="col-sm-8">${d.natureBusiness}</dd>
          <dt class="col-sm-4">Working Days / week</dt><dd class="col-sm-8">${d.workingDays}</dd>
          <dt class="col-sm-4">Number of Personnel</dt><dd class="col-sm-8">${d.personnel}</dd>
          <dt class="col-sm-4">Position/s Needed</dt><dd class="col-sm-8">${d.positions}</dd>
          <dt class="col-sm-4">Target Date</dt><dd class="col-sm-8">${d.targetDate || '—'}</dd>
          <dt class="col-sm-4">Gender Preference</dt><dd class="col-sm-8">${d.gender || '—'}</dd>
          <dt class="col-sm-4">Contract Duration</dt><dd class="col-sm-8">${d.contractDuration || '—'}</dd>
        </dl>
      </div>
    `;
  }

  // ensure Bootstrap Modal instance
 function getModal() {
  if (!previewModalInstance) {
    const modalEl = document.getElementById('previewModal');
    previewModalInstance = new bootstrap.Modal(modalEl, {
      backdrop: 'static',
      keyboard: false
    });
  }
  return previewModalInstance;
}

// For Edit button only (inside your IIFE)
const editBtn = document.querySelector('#previewModal .btn-secondary');
if (editBtn) {
  editBtn.addEventListener('click', function () {
    const modal = getModal();
    modal.hide();

    // After modal hides, remove the backdrop and unlock scroll
    document.getElementById('previewModal').addEventListener('hidden.bs.modal', function handler() {
      const backdrop = document.querySelector('.modal-backdrop');
      if (backdrop) backdrop.remove(); // remove black transparent layer

      document.body.classList.remove('modal-open');
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';

      this.removeEventListener('hidden.bs.modal', handler); // one-time listener
    });
  });
}

setTimeout(() => {
  form.reset();
  const modalEl = document.getElementById('previewModal');
  const modalInstance = bootstrap.Modal.getInstance(modalEl);
  if (modalInstance) {
    modalInstance.hide();
  }
}, 1400);



  // form submit -> show preview modal
  form.addEventListener('submit', function(ev){
    ev.preventDefault();
    if (!form.reportValidity()) return;

    currentData = {
      companyName: document.getElementById('companyName').value.trim(),
      address: document.getElementById('address').value.trim(),
      signatory: document.getElementById('signatory').value.trim(),
      designation: document.getElementById('designation').value.trim(),
      contactPerson: document.getElementById('contactPerson').value.trim(),
      contactNumber: document.getElementById('contactNumber').value.trim(),
      email: document.getElementById('email').value.trim(),
      natureBusiness: document.getElementById('natureBusiness').value.trim(),
      workingDays: document.getElementById('workingDays').value.trim(),
      personnel: document.getElementById('personnel').value.trim(),
      positions: document.getElementById('positions').value.trim(),
      targetDate: document.getElementById('targetDate').value || '',
      gender: document.getElementById('gender').value || '',
      contractDuration: document.getElementById('contractDuration').value.trim() || ''
    };

    modalContent.innerHTML = buildPreviewHtml(currentData);
    getModal().show();

    

  });

  // final submit -> POST to Google Apps Script
// final submit -> POST to Google Apps Script
finalBtn.addEventListener('click', function(){
  if (!currentData) return;
  finalBtn.disabled = true;

  // hide preview modal
  getModal().hide();

  // show loading modal
  const loadingModalEl = document.getElementById('loadingModal');
  const loadingModal = new bootstrap.Modal(loadingModalEl);
  document.getElementById("loadingMessage").innerText = "Please wait... Saving your data";
  loadingModal.show();

  // include token if you set one in Apps Script
  const payload = Object.assign({}, currentData);
  if (SECRET_TOKEN) payload.token = SECRET_TOKEN;

  fetch(WEB_APP_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
    body: new URLSearchParams(payload)
  })
  .then(response => response.json())
  .then(res => {
    if (res && res.status === 'success') {
      document.getElementById("loadingMessage").innerText = "✅ Success! Your data has been saved.";
      setTimeout(() => {
        form.reset();
        window.location.href = "index.html"
      }, 2000);
    } else {
      document.getElementById("loadingMessage").innerText = "❌ Error: " + (res.message || "Submission failed. Try again.");
      finalBtn.disabled = false;
      setTimeout(() => loadingModal.hide(), 2500);
    }
  })
  .catch(err => {
    console.error(err);
    document.getElementById("loadingMessage").innerText = "⚠️ Network error. Please try again later.";
    finalBtn.disabled = false;
    setTimeout(() => loadingModal.hide(), 2500);
  });
});

})();