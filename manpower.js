const form = document.getElementById('profilingForm');
const modalContent = document.getElementById('modalContent');
const previewModal = new bootstrap.Modal(document.getElementById('previewModal'));
const finalSubmit = document.getElementById('finalSubmit');

form.addEventListener('submit', function(e){
  e.preventDefault();

  // Collect form data
  const data = {
    'Registered Company Name': document.getElementById('companyName').value,
    'Authorized Signatory': document.getElementById('signatory').value,
    'Contact Person': document.getElementById('contactPerson').value,
    'Nature of Business': document.getElementById('natureBusiness').value,
    'Positions Needed': document.getElementById('positions').value,
    'Company Address': document.getElementById('address').value,
    'Designation': document.getElementById('designation').value,
    'Contact Number': document.getElementById('contactNumber').value,
    'Working Days': document.getElementById('workingDays').value,
    'Number of Personnel': document.getElementById('personnel').value,
    'Email': document.getElementById('email').value,
    'Target Date': document.getElementById('targetDate').value,
    'Gender Preference': document.getElementById('gender').value,
    'Contract Duration': document.getElementById('contractDuration').value
  };

  // Build preview
  modalContent.innerHTML = '';
  for (const [key, value] of Object.entries(data)) {
    modalContent.innerHTML += `<p><strong>${key}:</strong> ${value || '<em>Not provided</em>'}</p>`;
  }

  // Show modal
  previewModal.show();
});

finalSubmit.addEventListener('click', function(){
  previewModal.hide();
  alert('Submitted successfully!');
  form.reset();
});
