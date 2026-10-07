(function () {
  "use strict";

  var canonicalIcons = {
  "inquiry.svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" aria-hidden=\"true\">\n  <rect x=\"3\" y=\"4\" width=\"18\" height=\"16\" rx=\"2\"/>\n  <circle cx=\"9\" cy=\"10\" r=\"2\"/>\n  <path d=\"M5.5 17c.7-2 2-3 3.5-3s2.8 1 3.5 3M14 9h4m-4 4h4\"/>\n</svg>\n",
  "conversation.svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\">\n  <path d=\"M21 11a8 8 0 0 1-8 8H8l-5 3V11a9 9 0 0 1 18 0Z\"/>\n  <path d=\"M7 10h10\"/>\n</svg>\n",
  "call.svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\">\n  <path d=\"M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.68 2.8a2 2 0 0 1-.45 2.11L8.07 9.9a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.32 1.84.55 2.8.68A2 2 0 0 1 22 16.92z\"/>\n</svg>\n",
  "message.svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\">\n  <path d=\"M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z\"/>\n</svg>\n",
  "email.svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\">\n  <rect x=\"3\" y=\"5\" width=\"18\" height=\"14\" rx=\"2\"/>\n  <path d=\"m3 7 9 6 9-6\"/>\n</svg>\n",
  "search.svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\">\n  <circle cx=\"10\" cy=\"10\" r=\"7\"/>\n  <path d=\"m15 15 6 6\"/>\n</svg>\n",
  "visitor-avatar.svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"currentColor\">\n  <circle cx=\"12\" cy=\"7\" r=\"4\"/>\n  <path d=\"M4 21v-3a8 8 0 0 1 16 0v3Z\"/>\n</svg>\n",
  "voice-experience.svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.7\" stroke-linecap=\"round\" stroke-linejoin=\"round\">\n  <path d=\"M4 10v4m4-8v12m4-16v20m4-16v12m4-8v4\"/>\n</svg>\n"
};
  var heynajAvatar = "https://res.cloudinary.com/dt5j91krt/image/upload/v1775798166/HeyNaj_Logo_Widget_sfb5pe.png";

  function renderIcon(asset) {
    return '<span class="canonical-icon" aria-hidden="true">' + canonicalIcons[asset].replace("<svg ", '<svg focusable="false" ') + "</span>";
  }
  var inquiries = [
    {
      id: "demo-mika-santos",
      name: "Mika Santos",
      email: "mika.santos@example.com",
      phone: "+1 202-555-0147",
      channel: "Premium Live Voice",
      started: "Oct 6, 2026 · 10:24 AM",
      page: "/features",
      important: true,
      read: false,
      summary: "Mika runs a small web design agency and is exploring HeyNaj Flow for client websites. She asked whether each client can use their own business Knowledge and whether voice conversations are supported. She plans to test the widget, Knowledge, and Premium Live Voice before deciding how to use it with clients.",
      conversation: [
        { speaker: "Visitor", text: "Hi! I run a small web design agency. Can I use HeyNaj Flow on my clients’ websites?", time: "10:24 AM" },
        { speaker: "HeyNaj", text: "Yes. Agencies can help clients set up HeyNaj Flow on their websites. Each client can use their own account and business Knowledge, while you can support the setup as part of your own client service.", time: "10:24 AM" },
        { speaker: "Visitor", text: "Can each client have their own business information so the assistant answers differently for every website?", time: "10:25 AM" },
        { speaker: "HeyNaj", text: "Yes. Each workspace can have its own approved business Knowledge, so answers can be based on the information provided for that specific business.", time: "10:25 AM" },
        { speaker: "Visitor", text: "What about voice? Some of my clients would probably want visitors to talk instead of only typing.", time: "10:26 AM" },
        { speaker: "HeyNaj", text: "HeyNaj Flow supports text and voice experiences. Standard Voice uses supported browser or device speech capabilities, while Premium Live Voice can use compatible realtime AI voice providers.", time: "10:26 AM" },
        { speaker: "Visitor", text: "Nice. I want to test the widget, Knowledge, and Premium Live Voice first. Can someone follow up with me?", time: "10:27 AM" },
        { speaker: "HeyNaj", text: "Absolutely. You can leave your contact details so the team has the conversation context when they follow up.", time: "10:27 AM" },
        { speaker: "Visitor", text: "Sure. Mika Santos, mika.santos@example.com, +1 202-555-0147.", time: "10:28 AM" },
        { speaker: "HeyNaj", text: "Thanks, Mika. Your details have been added to this Inquiry so the team can follow up with the context from our conversation.", time: "10:28 AM" }
      ],
      internalNote: "Agency owner — interested in testing on a client project. Follow up after initial workspace test."
    },
    {
      id: "demo-alex-rivera",
      name: "Alex Rivera",
      email: "alex.rivera@example.com",
      phone: "Not provided",
      channel: "Text",
      started: "Oct 5, 2026 · 3:42 PM",
      page: "/services",
      important: false,
      read: true,
      summary: "Alex is comparing service options and asked what information is available before getting started. No phone number was provided.",
      conversation: [
        { speaker: "Visitor", text: "What should I prepare before getting started?", time: "3:42 PM" },
        { speaker: "HeyNaj", text: "The exact requirements depend on the business setup, but the available business Knowledge can explain the recommended preparation and next steps.", time: "3:42 PM" },
        { speaker: "Visitor", text: "Can I review everything before I decide?", time: "3:43 PM" },
        { speaker: "HeyNaj", text: "Yes. You can explore the available information first and contact the business if you want help with the next step.", time: "3:43 PM" }
      ],
      internalNote: "No internal note added for this demo Inquiry."
    },
    {
      id: "demo-jordan-lee",
      name: "Jordan Lee",
      email: "jordan.lee@example.com",
      phone: "+1 202-555-0182",
      channel: "Standard Voice",
      started: "Oct 5, 2026 · 11:18 AM",
      page: "/get-started/",
      important: false,
      read: true,
      summary: "Jordan asked about getting started and whether voice interaction is available. Contact details were provided for follow-up.",
      conversation: [
        { speaker: "Visitor", text: "Can I try this before setting everything up?", time: "11:18 AM" },
        { speaker: "HeyNaj", text: "You can review the available setup information and test the experience as you configure your workspace.", time: "11:18 AM" },
        { speaker: "Visitor", text: "Does voice work too?", time: "11:19 AM" },
        { speaker: "HeyNaj", text: "Yes. HeyNaj Flow includes supported voice experiences in addition to text.", time: "11:19 AM" }
      ],
      internalNote: "No internal note added for this demo Inquiry."
    }
  ];

  var state = { selectedId: "demo-mika-santos", query: "", filter: "all" };
  var shell = document.getElementById("inquiriesShell");
  var list = document.getElementById("inquiryList");
  var detail = document.getElementById("inquiryDetail");
  var empty = document.getElementById("inquiryEmpty");
  var listCount = document.getElementById("inquiryListCount");
  var search = document.getElementById("inquirySearch");
  var filter = document.getElementById("inquiryFilter");

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function isVoice(inquiry) {
    return inquiry.channel.toLowerCase().includes("voice");
  }

  function filteredInquiries() {
    var query = state.query.toLowerCase();
    return inquiries.filter(function (inquiry) {
      var haystack = [inquiry.name, inquiry.email, inquiry.channel, inquiry.summary, inquiry.page].join(" ").toLowerCase();
      var matchesQuery = !query || haystack.includes(query);
      var matchesFilter = state.filter === "all" ||
        (state.filter === "important" && inquiry.important) ||
        (state.filter === "voice" && isVoice(inquiry)) ||
        (state.filter === "text" && !isVoice(inquiry));
      return matchesQuery && matchesFilter;
    });
  }

  function channelIcon(inquiry) {
    return isVoice(inquiry) ? "voice-experience.svg" : "conversation.svg";
  }

  function renderList() {
    var visible = filteredInquiries();
    list.replaceChildren();
    listCount.textContent = visible.length + " of " + inquiries.length + " sample inquiries";
    empty.hidden = visible.length > 0;

    visible.forEach(function (inquiry) {
      var row = document.createElement("button");
      row.type = "button";
      row.className = "inquiry-row" + (inquiry.id === state.selectedId ? " selected" : "") + (!inquiry.read ? " unread" : "");
      row.setAttribute("aria-current", inquiry.id === state.selectedId ? "true" : "false");
      row.setAttribute("aria-label", "View Inquiry from " + inquiry.name);
      row.innerHTML =
        '<span class="row-copy"><strong>' + escapeHtml(inquiry.name) + '</strong><span class="row-email">' + escapeHtml(inquiry.email) + '</span><span class="row-summary">' + escapeHtml(inquiry.summary) + '</span></span>' +
        '<span class="row-side"><span class="inquiry-badge">' + escapeHtml(inquiry.channel) + '</span><span class="row-time">' + escapeHtml(inquiry.started) + '</span></span>' +
        '<span class="row-priority" aria-label="' + (inquiry.important ? "Important" : "Not important") + '">' + (inquiry.important ? "★" : "☆") + '</span>';
      row.addEventListener("click", function () {
        selectInquiry(inquiry.id, true);
      });
      list.append(row);
    });
  }

  function renderContactAction(label, asset, available) {
    return '<button type="button" class="contact-action' + (available ? "" : " unavailable") + '" data-demo-action="' + label + '"' + (available ? "" : " disabled") + ' aria-label="' + label + (available ? " demo control" : " unavailable") + '">' + renderIcon(asset) + '<span>' + label + '</span></button>';
  }

  function renderConversation(inquiry) {
    return inquiry.conversation.map(function (message) {
      var assistant = message.speaker === "HeyNaj";
      return '<article class="inquiry-message ' + (assistant ? "assistant" : "visitor") + '">' +
        '<span class="message-avatar" aria-hidden="true">' + (assistant ? '<img src="' + heynajAvatar + '" alt="" width="32" height="32">' : renderIcon("visitor-avatar.svg")) + '</span>' +
        '<div class="message-content"><header><strong>' + escapeHtml(message.speaker) + '</strong><time>' + escapeHtml(message.time) + '</time></header><p>' + escapeHtml(message.text) + '</p></div>' +
        '</article>';
    }).join("");
  }

  function renderDetail(inquiry) {
    var phoneAvailable = inquiry.phone !== "Not provided";
    detail.innerHTML =
      '<div class="inquiry-detail-head">' +
        '<div class="inquiry-detail-identity"><div class="inquiry-detail-name"><h2>' + escapeHtml(inquiry.name) + '</h2><span class="inquiry-badge lead">' + escapeHtml(inquiry.channel) + '</span><span class="inquiry-read-state"><i class="unread-dot" aria-hidden="true"></i>' + (inquiry.read ? "Read" : "Unread") + '</span></div><p>' + escapeHtml(inquiry.email) + '</p></div>' +
        '<button type="button" class="detail-back" id="detailBack">← <span>Inquiries</span></button>' +
      '</div>' +
      '<div class="inquiry-contact-actions" aria-label="Follow-up actions">' +
        renderContactAction("Call", "call.svg", phoneAvailable) +
        renderContactAction("Message", "message.svg", phoneAvailable) +
        renderContactAction("Email", "email.svg", true) +
      '</div>' +
      '<dl class="detail-data">' +
        '<div><dt>Name</dt><dd>' + escapeHtml(inquiry.name) + '</dd></div>' +
        '<div><dt>Email</dt><dd>' + escapeHtml(inquiry.email) + '</dd></div>' +
        '<div><dt>Phone</dt><dd>' + escapeHtml(inquiry.phone) + '</dd></div>' +
        '<div><dt>Channel</dt><dd>' + escapeHtml(inquiry.channel) + '</dd></div>' +
        '<div><dt>Started</dt><dd>' + escapeHtml(inquiry.started) + '</dd></div>' +
        '<div><dt>Page</dt><dd><code>' + escapeHtml(inquiry.page) + '</code></dd></div>' +
      '</dl>' +
      '<div class="inquiry-priority-detail">' + (inquiry.important ? "★ Important" : "☆ Not marked important") + '</div>' +
      '<section class="inquiry-summary-card" aria-labelledby="summary-title"><h3 id="summary-title">Conversation summary</h3><p>' + escapeHtml(inquiry.summary) + '</p></section>' +
      '<section class="inquiry-transcript" aria-labelledby="conversation-title"><div class="conversation-head"><h3 id="conversation-title">' + renderIcon("conversation.svg") + 'Conversation</h3><span>' + escapeHtml(inquiry.channel) + '</span></div>' + renderConversation(inquiry) + '</section>' +
      '<section class="inquiry-note" aria-labelledby="note-title"><span class="note-icon" aria-hidden="true">ⓘ</span><div><label id="note-title" for="internalNote">Internal Note</label><textarea id="internalNote" readonly>' + escapeHtml(inquiry.internalNote) + '</textarea><p><strong>Internal Note ≠ visitor reply.</strong> Demo-only visual field; edits are not saved.</p></div></section>' +
      '<p class="demo-action-note" id="demoActionNote" role="status">Contact actions are demo controls and do not initiate calls, messages, or email.</p>';

    document.getElementById("detailBack").addEventListener("click", function () {
      shell.classList.remove("is-detail-open");
      document.querySelector(".inquiry-row.selected")?.focus();
    });

    detail.querySelectorAll("[data-demo-action]").forEach(function (button) {
      button.addEventListener("click", function () {
        document.getElementById("demoActionNote").textContent = "Demo control — no " + button.dataset.demoAction.toLowerCase() + " was sent.";
      });
    });
  }

  function selectInquiry(id, revealDetail) {
    var inquiry = inquiries.find(function (item) { return item.id === id; });
    if (!inquiry) return;
    state.selectedId = id;
    renderList();
    renderDetail(inquiry);
    if (revealDetail) {
      shell.classList.add("is-detail-open");
      detail.focus({ preventScroll: true });
    }
  }

  search.addEventListener("input", function (event) {
    state.query = event.target.value.trim();
    renderList();
  });

  filter.addEventListener("change", function (event) {
    state.filter = event.target.value;
    renderList();
  });

  renderList();
  renderDetail(inquiries[0]);
})();
