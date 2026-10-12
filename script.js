const months = ['Baisakh','Jestha','Asar','Shrawan','Bhadra','Ashwin','Kartik','Mangsir','Poush','Magh','Falgun','Chaitra'];
// Bikram Sambat month lengths vary a little by year. The selector shows the current year.
const monthDays = {2083:[31,32,31,32,31,30,30,29,29,30,29,30]};
const $ = (id) => document.getElementById(id);
const yearSelect = $('bsYear'), monthSelect = $('bsMonth'), daySelect = $('bsDay');
[2083].forEach(year => yearSelect.add(new Option(String(year),year)));
months.forEach((month,index) => monthSelect.add(new Option(month,index)));
yearSelect.value='2083'; monthSelect.value='5';
function updateDays(preferred=1){
  const days=monthDays[yearSelect.value][Number(monthSelect.value)];
  daySelect.replaceChildren();
  for(let day=1;day<=days;day++) daySelect.add(new Option(String(day).padStart(2,'0'),day));
  daySelect.value=String(Math.min(preferred,days));
}
updateDays(12);
yearSelect.addEventListener('change',()=>updateDays(Number(daySelect.value)));
monthSelect.addEventListener('change',()=>updateDays(Number(daySelect.value)));

let passengers=1;
function setPassengers(value){passengers=Math.max(1,Math.min(5,value));$('passengerCount').value=passengers;$('passengers').value=passengers;$('minusPassenger').disabled=passengers===1;$('plusPassenger').disabled=passengers===5;}
$('minusPassenger').addEventListener('click',()=>setPassengers(passengers-1));
$('plusPassenger').addEventListener('click',()=>setPassengers(passengers+1));
setPassengers(1);

$('currentLocation').addEventListener('click',()=>{
  const button=$('currentLocation');
  if(!navigator.geolocation){button.textContent='Location is unavailable — enter your place';return;}
  button.disabled=true;
  button.textContent='Finding your location…';
  const locate=(attempt=0)=>navigator.geolocation.getCurrentPosition(({coords})=>{
    const lat=coords.latitude.toFixed(5),lon=coords.longitude.toFixed(5);
    $('pickup').value=`My current location — ${lat}, ${lon}`;
    $('pickupCoordinates').value=`${lat}, ${lon}`;
    button.textContent='◎ Location added · add the place name';
    button.disabled=false;
  },error=>{
    if(error.code!==1 && attempt<1){button.textContent='Still finding your location…';setTimeout(()=>locate(attempt+1),500);return;}
    button.disabled=false;
    button.textContent=error.code===1?'Location access blocked — enter your place':'Could not find location — try again';
  },{enableHighAccuracy:false,timeout:20000,maximumAge:60000});
  locate();
});

// Provide the same destination suggestions on mobile browsers that lack a native datalist.
const destinationInput=$('destination');
const destinationOptions=$('destinationOptions');
const destinationChoices=[
  'Arghakhanchi','Baglung','Baitadi','Bandipur','Banke','Bara','Bardiya','Bhaktapur','Bhairahawa',
  'Chitwan','Dadeldhura','Dailekh','Dang','Dhanusha','Dhading','Dhankuta','Doti','Gulmi',
  'Ilam','Janakpur','Jhapa','Kailali','Kanchanpur','Kapilvastu','Kathmandu','Kaski','Lamjung',
  'Lalitpur','Lumbini','Makwanpur','Morang','Nawalpur','Nagarkot','Nuwakot','Other place',
  'Palpa','Parasi','Parbat','Parsa','Pokhara','Pyuthan','Ramechhap','Rautahat','Rolpa','Rukum',
  'Salyan','Saptari','Sarlahi','Siraha','Sindhuli','Surkhet','Sunsari','Syangja','Tanahun',
  'Tehrathum','Udayapur'
].sort((a,b)=>a.localeCompare(b));
let activeDestination=-1;
function closeDestinationOptions(){destinationOptions.hidden=true;destinationInput.setAttribute('aria-expanded','false');activeDestination=-1;}
function renderDestinationOptions(){
  const query=destinationInput.value.trim().toLocaleLowerCase();
  const matches=destinationChoices.filter(place=>!query||place.toLocaleLowerCase().includes(query));
  destinationOptions.replaceChildren();activeDestination=-1;
  matches.forEach((place,index)=>{
    const option=document.createElement('button');
    option.type='button';option.className='destination-option';option.id=`destinationOption${index}`;
    option.setAttribute('role','option');option.setAttribute('aria-selected','false');option.textContent=place;
    option.addEventListener('pointerdown',event=>event.preventDefault());
    option.addEventListener('click',()=>{destinationInput.value=place;closeDestinationOptions();});
    destinationOptions.append(option);
  });
  if(!matches.length){closeDestinationOptions();return;}
  destinationOptions.hidden=false;destinationInput.setAttribute('aria-expanded','true');
}
destinationInput.addEventListener('focus',renderDestinationOptions);
destinationInput.addEventListener('input',renderDestinationOptions);
destinationInput.addEventListener('keydown',event=>{
  const options=[...destinationOptions.querySelectorAll('[role="option"]')];
  if(event.key==='Escape'){closeDestinationOptions();return;}
  if(event.key==='ArrowDown'&&options.length){event.preventDefault();activeDestination=(activeDestination+1)%options.length;}
  else if(event.key==='ArrowUp'&&options.length){event.preventDefault();activeDestination=(activeDestination-1+options.length)%options.length;}
  else if(event.key==='Enter'&&!destinationOptions.hidden&&activeDestination>=0){event.preventDefault();options[activeDestination].click();return;}
  else return;
  options.forEach((option,index)=>{option.setAttribute('aria-selected',String(index===activeDestination));if(index===activeDestination)option.scrollIntoView({block:'nearest'});});
});
document.addEventListener('pointerdown',event=>{if(!event.target.closest('.destination-field'))closeDestinationOptions();});

const bookingSection=$('booking');
const bookingRevealTargets=bookingSection?.querySelectorAll('.section-heading,#bookingForm>.route-grid,#bookingForm>.details-grid,#bookingForm>.notes-card,#bookingForm>.form-bottom');
if(bookingRevealTargets?.length){
  bookingRevealTargets.forEach((element,index)=>{element.classList.add('reveal-on-scroll');element.style.setProperty('--reveal-delay',`${Math.min(index*90,360)}ms`);});
  if('IntersectionObserver' in window){
    const bookingObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{
      if(entry.isIntersecting){entry.target.classList.add('is-revealed');bookingObserver.unobserve(entry.target);}
    }),{threshold:0.12});
    bookingRevealTargets.forEach(element=>bookingObserver.observe(element));
  }else bookingRevealTargets.forEach(element=>element.classList.add('is-revealed'));
}

const footerRevealTargets=document.querySelectorAll('footer .footer-brand,footer p,footer>span');
footerRevealTargets.forEach((element,index)=>{element.classList.add('footer-reveal');element.style.setProperty('--footer-delay',`${index*120}ms`);});
if(footerRevealTargets.length&&'IntersectionObserver' in window){
  const footerObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{
    if(entry.isIntersecting){entry.target.classList.add('is-revealed');footerObserver.unobserve(entry.target);}
  }),{threshold:0.2});
  footerRevealTargets.forEach(element=>footerObserver.observe(element));
}else footerRevealTargets.forEach(element=>element.classList.add('is-revealed'));

const destinationTrack=document.querySelector('.destination-track');
const destinationGroup=destinationTrack?.querySelector('.destination-group');
let suppressDestinationClick=false;
if(destinationGroup){
  const duplicate=destinationGroup.cloneNode(true);
  duplicate.setAttribute('aria-hidden','true');
  duplicate.querySelectorAll('button,a').forEach(item=>item.tabIndex=-1);
  destinationTrack.append(duplicate);

  // Keep the carousel draggable while the automatic right-to-left motion continues.
  const viewport=document.querySelector('.destination-grid');
  let offset=0, drag=null;
  const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
  const groupWidth=()=>destinationGroup.getBoundingClientRect().width;
  const render=()=>{destinationTrack.style.transform=`translate3d(${offset}px,0,0)`;};
  const normalize=()=>{
    const width=groupWidth();
    if(width>0){while(offset<=-width)offset+=width;while(offset>0)offset-=width;}
  };
  const animate=()=>{
    if(!drag && !reducedMotion.matches && !document.hidden){offset-=0.55;normalize();render();}
    requestAnimationFrame(animate);
  };
  viewport.addEventListener('pointerdown',event=>{
    if(event.button!==0 && event.pointerType==='mouse')return;
    drag={id:event.pointerId,startX:event.clientX,startOffset:offset,moved:false};
    viewport.setPointerCapture(event.pointerId);
    viewport.classList.add('is-dragging');
  });
  viewport.addEventListener('pointermove',event=>{
    if(!drag || drag.id!==event.pointerId)return;
    const delta=event.clientX-drag.startX;
    if(Math.abs(delta)>5)drag.moved=true;
    offset=drag.startOffset+delta;normalize();render();
  });
  const endDrag=event=>{
    if(!drag || drag.id!==event.pointerId)return;
    suppressDestinationClick=drag.moved;drag=null;viewport.classList.remove('is-dragging');
    if(viewport.hasPointerCapture(event.pointerId))viewport.releasePointerCapture(event.pointerId);
  };
  viewport.addEventListener('pointerup',endDrag);
  viewport.addEventListener('pointercancel',endDrag);
  requestAnimationFrame(animate);
}
destinationTrack?.addEventListener('click',event=>{
  if(suppressDestinationClick){suppressDestinationClick=false;event.preventDefault();return;}
  const card=event.target.closest('button[data-destination]');
  if(!card || card.closest('[aria-hidden="true"]')) return;
  $('destination').value=card.dataset.destination;
  $('booking').scrollIntoView({behavior:'smooth'});
  $('destination').focus({preventScroll:true});
});

function bookingMessage(){
  const day=String(daySelect.value).padStart(2,'0');
  const date=`${day} ${months[Number(monthSelect.value)]} ${yearSelect.value} BS`;
  const formatTime=$('pickupTime').value;
  const notes=$('notes').value.trim() || 'None';
  const pickupCoordinates=$('pickupCoordinates').value.trim();
  return ['Namaste! I would like to request an e-drive cab.','',`Pick-up: ${$('pickup').value.trim()}`,pickupCoordinates?`Pickup coordinates: ${pickupCoordinates}`:null,`Destination: ${$('destination').value.trim()}`,`Date: ${date}`,`Pick-up time: ${formatTime} (Nepal time)`,`Passengers: ${passengers}`,`My contact: ${$('phone').value.trim()}`,`Notes: ${notes}`].filter(Boolean).join('\n');
}
$('bookingForm').addEventListener('submit',event=>{
  event.preventDefault();
  const result=$('sendResult'),waNumber='9779843670623';
  const whatsappUrl=`https://wa.me/${waNumber}?text=${encodeURIComponent(bookingMessage())}`;
  window.open(whatsappUrl,'_blank','noopener,noreferrer');
  result.innerHTML=`<strong>Your booking message is ready for WhatsApp.</strong><br>If WhatsApp did not open, <a target="_blank" rel="noopener noreferrer" href="${whatsappUrl}">open the chat with 9843670623 ↗</a><br><small>Review the details and press Send in WhatsApp to complete your request.</small>`;
  result.hidden=false;
  result.scrollIntoView({behavior:'smooth',block:'nearest'});
});
