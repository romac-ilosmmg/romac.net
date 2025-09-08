document.addEventListener("DOMContentLoaded", function () {
  const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzcIfu-G85UQR0qgFxxb_tIe4BesEJvS3ClvlWlTYKtM-RCw6Wrxp2ZS1edtxAqZF-C/exec';
  const RESUME_MAX = 5 * 1024 * 1024; 
  const IMAGE_MAX = 3 * 1024 * 1024;  
  const MAX_IMAGES = 5;

  const form = document.getElementById('applicationForm');
  const resumeInput = document.getElementById('resumeUrl');
  const imagesInput = document.getElementById('imageUrls');
  const previewArea = document.getElementById('previewArea');

  // ✅ Image Preview + Remove Button
  if (imagesInput && previewArea) {
    imagesInput.addEventListener('change', function () {

      Array.from(this.files).forEach((file, index) => {
        if (!file.type.startsWith('image/')) return;

        const url = URL.createObjectURL(file);

        const wrapper = document.createElement('div');
        wrapper.style.position = 'relative';
        wrapper.style.display = 'inline-block';
        wrapper.style.margin = '5px';
        wrapper.style.maxWidth = '120px';
        wrapper.style.textAlign = 'center';

        // preview image + filename
        wrapper.innerHTML = `
          <img src="${url}" style="width:100%;height:80px;object-fit:cover;border:1px solid #ddd;border-radius:4px;">
          <small style="display:block;word-break:break-word;">${file.name}</small>
        `;

        // remove button
        const removeBtn = document.createElement('button');
        removeBtn.innerHTML = '✖';
        removeBtn.style.position = 'absolute';
        removeBtn.style.top = '2px';
        removeBtn.style.right = '2px';
        removeBtn.style.background = 'transparent';
        removeBtn.style.color = 'red';
        removeBtn.style.border = 'none';
        removeBtn.style.cursor = 'pointer';
        removeBtn.style.fontSize = '16px';
        removeBtn.style.fontWeight = 'bold';
        removeBtn.title = 'Remove this image';

        removeBtn.addEventListener('click', (e) => {
          e.preventDefault();
          wrapper.remove();

          // update input files (remove selected file)
          const dt = new DataTransfer();
          Array.from(imagesInput.files).forEach((f, i) => {
            if (i !== index) dt.items.add(f);
          });
          imagesInput.files = dt.files;
        });

        wrapper.appendChild(removeBtn);
        previewArea.appendChild(wrapper);
      });
    });
  }

  function fileToDataURL(file){
    return new Promise((resolve,reject)=>{
      const reader = new FileReader();
      reader.onload = ()=>resolve(reader.result);
      reader.onerror = ()=>{ reader.abort(); reject(new Error('File read error')); };
      reader.readAsDataURL(file);
    });
  }

  function validateResume(file){
    if(!file) return true;
    const allowed = ['application/pdf','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    const extAllowed = ['.pdf','.doc','.docx'];
    if(file.size>RESUME_MAX){ alert(`Resume must be <= ${Math.round(RESUME_MAX/1024/1024)} MB.`); return false; }
    const name = (file.name||'').toLowerCase();
    if(!allowed.includes(file.type) && !extAllowed.some(e=>name.endsWith(e))){ alert('Resume must be PDF, DOC, or DOCX.'); return false; }
    return true;
  }

  function validateImages(files){
    if(!files || files.length===0) return true;
    if(files.length>MAX_IMAGES){ alert(`Max ${MAX_IMAGES} images allowed.`); return false; }
    for(let f of files){
      if(!f.type.startsWith('image/')){ alert('Only image files allowed.'); return false; }
      if(f.size>IMAGE_MAX){ alert(`Each image must be <= ${Math.round(IMAGE_MAX/1024/1024)} MB.`); return false; }
    }
    return true;
  }

  if(form){
    form.addEventListener('submit', async function(ev){
      ev.preventDefault();
      if(!form.checkValidity()){ form.reportValidity(); return; }

      const fields = {};
      Array.from(form.elements).forEach(el=>{
        if(el.id && el.type!=="file") fields[el.id]=el.value;
      });

      const resumeFile = resumeInput?resumeInput.files[0]:null;
      const imageFiles = imagesInput?Array.from(imagesInput.files):[];

      if(!validateResume(resumeFile)) return;
      if(!validateImages(imageFiles)) return;

      let resumePayload = null;
      if(resumeFile){
        try{
          const dataUrl = await fileToDataURL(resumeFile);
          resumePayload = { name: resumeFile.name, mimeType: resumeFile.type||'application/octet-stream', base64:dataUrl };
        } catch(e){ alert('Error reading resume'); return; }
      }

      const imagesPayload = [];
      for(let f of imageFiles){
        try{
          const dataUrl = await fileToDataURL(f);
          imagesPayload.push({ name:f.name, mimeType:f.type||'image/png', base64:dataUrl });
        } catch(e){ alert('Error reading image: '+f.name); return; }
      }

      const payload = { fields, resume:resumePayload, images:imagesPayload };

      try{
        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.disabled=true; submitBtn.innerText='Please Wait...';

        const resp = await fetch(APPS_SCRIPT_URL,{
          method:'POST',
          headers:{ 'Content-Type':'application/json' },
          body:JSON.stringify(payload),
          mode: 'no-cors'
        });

        // no-cors mode: cannot read resp.json, skip parsing
        alert('Application submitted successfully!');
        form.reset(); 
        if(previewArea) previewArea.innerHTML='';
        window.location.href = "index.html"; // redirect after success

      } catch(err){
        console.error(err);
        alert('Network/server error. Check Apps Script deployment.');
      } finally{
        const submitBtn = form.querySelector('button[type="submit"]');
        if(submitBtn){ submitBtn.disabled=false; submitBtn.innerText='Submit Application'; }
      }
    });
  }
});
