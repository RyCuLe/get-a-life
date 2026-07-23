const CURRENT_PHASE = 5;

let checkedRadios = {};

function applyPhaseRestrictions() {
  const allowedTabs = ['appearance', 'personality'];
  if (CURRENT_PHASE >= 2) allowedTabs.push('skills');
  if (CURRENT_PHASE >= 3) allowedTabs.push('career');
  if (CURRENT_PHASE >= 5) allowedTabs.push('aspiration');

  document.querySelectorAll('.tabs button').forEach(button => {
    const tabName = button.id.replace('tab-', '');
    if (!allowedTabs.includes(tabName)) {
      button.disabled = true;
      button.classList.add('tab-locked');
    } else {
      button.disabled = false;
      button.classList.remove('tab-locked');
    }
  });

  document.querySelectorAll('.career-card').forEach(card => {
    const promotionCard = card.querySelectorAll('.career-levels .achievement-card')[1];
    if (promotionCard) {
      if (CURRENT_PHASE < 4) {
        promotionCard.style.display = 'none';
        const input = promotionCard.querySelector('input[type="radio"]');
        if (input) input.disabled = true;
      } else {
        promotionCard.style.display = '';
        const input = promotionCard.querySelector('input[type="radio"]');
        if (input) input.disabled = false;
      }
    }
  });
}

function saveToLocalStorage() {
  const state = {};
  document.querySelectorAll("input[type='checkbox'], input[type='radio']").forEach(input => {
    if (input.type === 'checkbox') state[input.id] = input.checked;
    if (input.type === 'radio' && input.checked) state[input.name] = input.value;
  });
  
  const nameEl = document.getElementById("playerName");
  if (nameEl) state['playerName'] = nameEl.value;
  
  localStorage.setItem("getALife_save", JSON.stringify(state));
}

function loadFromLocalStorage() {
  const saved = localStorage.getItem("getALife_save");
  if (!saved) return;
  const state = JSON.parse(saved);

  Object.keys(state).forEach(key => {
    const el = document.getElementById(key);
    if (el && el.type === 'checkbox') el.checked = state[key];
    if (el && el.id === 'playerName') el.value = state[key];
  });

  document.querySelectorAll("input[type='radio']").forEach(radio => {
    if (state[radio.name] === radio.value && !radio.disabled) {
      radio.checked = true;
      checkedRadios[radio.name] = radio; 
    }
  });
}

function count(ids) {
  return ids.reduce((n, id) => {
    const el = document.getElementById(id);
    return n + (el && el.checked ? 1 : 0);
  }, 0);
}

function bar(n) {
  return "■".repeat(n) + "□".repeat(3 - n);
}

function setBar(id, left, ids, right) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = `${left} ${bar(count(ids))} ${right}`;
}

function setSkill(id, name, ids) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = `${name} ${bar(count(ids))}`;
}

function updateAll() {
  setBar("trait1-bar", "Shy", ["shy1", "shy2", "shy3"], "Outgoing");
  setBar("trait2-bar", "Grouchy", ["nice1", "nice2", "nice3"], "Nice");
  setBar("trait3-bar", "Serious", ["play1", "play2", "play3"], "Playful");
  setBar("trait4-bar", "Sloppy", ["neat1", "neat2", "neat3"], "Neat");
  setBar("trait5-bar", "Lazy", ["active1", "active2", "active3"], "Active");

  setSkill("skillCook", "Cooking", ["cook1", "cook2", "cook3"]);
  setSkill("skillMech", "Mechanical", ["mech1", "mech2", "mech3"]);
  setSkill("skillChar", "Charisma", ["char1", "char2", "char3"]);
  setSkill("skillBody", "Body", ["body1", "body2", "body3"]);
  setSkill("skillLog", "Logic", ["log1", "log2", "log3"]);
  setSkill("skillCre", "Creativity", ["cre1", "cre2", "cre3"]);

  saveToLocalStorage();
}

function showTab(id) {
  const tabBtn = document.getElementById("tab-" + id);
  if (tabBtn && tabBtn.disabled) return;

  document.querySelectorAll(".tab-content").forEach(t => t.classList.remove("active"));
  document.querySelectorAll(".tabs button").forEach(b => b.classList.remove("active"));

  document.getElementById(id).classList.add("active");
  if (tabBtn) tabBtn.classList.add("active");

  const btnContainer = document.getElementById("action-btn-container");
  if (btnContainer) {
    btnContainer.style.display = (id === "result") ? "none" : "block";
  }
}

function generateAvatar() {
  document.getElementById("resName").textContent = document.getElementById("playerName").value || "Name";

  const traits = ["trait1-bar", "trait2-bar", "trait3-bar", "trait4-bar", "trait5-bar"];
  document.getElementById("resPersonality").innerHTML = traits
    .map(id => document.getElementById(id).textContent)
    .join("<br>");

  const skills = ["skillCook", "skillMech", "skillChar", "skillBody", "skillLog", "skillCre"];
  document.getElementById("resSkills").innerHTML = skills
    .map(id => document.getElementById(id).textContent)
    .join("<br>");

  const career = document.querySelector('input[name="career"]:checked');
  document.getElementById("resCareer").textContent = career ? career.value : "Unemployed";

  const aspiration = document.querySelector('input[name="aspiration"]:checked');
  document.getElementById("resAspiration").textContent = aspiration ? aspiration.value : "None";

  const file = document.getElementById("avatarImage").files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => { document.getElementById("resAvatar").src = e.target.result; };
    reader.readAsDataURL(file);
  }

  showTab("result");
}

function backToEdit() {
  showTab("appearance");
}

function saveAvatar() {
  const card = document.getElementById("avatarCard");

  requestAnimationFrame(() => {
    html2canvas(card, {
      backgroundColor: null,
      useCORS: true,
      allowTaint: false,
      scale: 4,
      logging: false,
      imageTimeout: 0,
      scrollX: 0,
      scrollY: -window.scrollY
    }).then(canvas => {
      const link = document.createElement("a");
      link.download = "GetALifeAvatar.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
    });
  });
}

document.querySelectorAll("input").forEach(i => {
  i.addEventListener("change", updateAll);
  
  if (i.type === "text") {
    i.addEventListener("input", updateAll);
  }

  if (i.type === "radio") {
    i.addEventListener("click", function(e) {
      if (this.disabled) return;
      if (checkedRadios[this.name] === this) {
        this.checked = false;
        checkedRadios[this.name] = null;
        updateAll();
      } else {
        checkedRadios[this.name] = this;
      }
    });
  }
});

applyPhaseRestrictions();
loadFromLocalStorage(); 
updateAll();
showTab("appearance");
