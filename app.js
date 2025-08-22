// --- تهيئة Firebase ---
const firebaseConfig = {
  apiKey: "AIzaSyCUb5ySGCLuNwBlCbZx_VuaDfqMtWno1cs",
  authDomain: "tttr-dbde2.firebaseapp.com",
  projectId: "tttr-dbde2",
  storageBucket: "tttr-dbde2.appspot.com",
  messagingSenderId: "296112669273",
  appId: "1:296112669273:web:ae6f583e15705a688be748",
  measurementId: "G-GP1C50C9E9"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// --- تبديل العملات ---
document.getElementById('try-btn').addEventListener('click',()=>{document.getElementById('try-btn').classList.add('active');document.getElementById('usd-btn').classList.remove('active');});
document.getElementById('usd-btn').addEventListener('click',()=>{document.getElementById('usd-btn').classList.add('active');document.getElementById('try-btn').classList.remove('active');});

// --- إضافة تبرع ---
document.getElementById('donate-btn').addEventListener('click', async function(){
    const amount = document.getElementById('amount').value;
    const name = document.getElementById('name').value;
    const phone = document.getElementById('phone').value;
    const message = document.getElementById('message').value;
    const currency = document.querySelector('.currency-btn.active').id==='try-btn'?'TRY':'USD';

    if(amount && name && phone){
        const donation = {
            name,
            amount: parseInt(amount),
            currency,
            phone,
            message,
            date: firebase.firestore.Timestamp.fromDate(new Date())
        };
        await db.collection("donations").add(donation);

        // مسح الحقول
        document.getElementById('amount').value='';
        document.getElementById('name').value='';
        document.getElementById('phone').value='';
        document.getElementById('message').value='';
    } else { alert('يرجى ملء جميع الحقول المطلوبة'); }
});

// --- عرض التبرعات مباشرة ---
function renderDonation(doc){
    const donorsList=document.getElementById('donors-list');
    const emptyState=document.querySelector('.empty-state');
    if(emptyState) emptyState.remove();
    const donorItem=document.createElement('div');
    donorItem.className='donor-item';
    const data=doc.data();
    donorItem.innerHTML=`
        <div class="donor-info">
            <div class="donor-name">${data.name}</div>
            <div class="donor-amount">${data.amount} ${data.currency==='TRY'?'₺':'$'}</div>
            <div class="donor-date">${new Date(data.date.seconds*1000).toLocaleDateString('ar-EG')}</div>
            ${data.message?`<div class="donor-message">${data.message}</div>`:''}
        </div>
    `;
    donorsList.prepend(donorItem);
}

// --- التحديث المباشر ---
db.collection("donations").orderBy("date","desc").onSnapshot(snapshot=>{
    snapshot.docChanges().forEach(change=>{
        if(change.type==="added"){ renderDonation(change.doc); updateTotal(); }
    });
});

// --- تحديث إجمالي التبرعات ---
async function updateTotal(){
    const snapshot=await db.collection("donations").get();
    let total=0;
    snapshot.forEach(doc=>{
        const data=doc.data();
        total+=data.currency==='TRY'?data.amount:data.amount*20;
    });
    document.getElementById('total-amount').textContent=total.toLocaleString()+' ₺';
}