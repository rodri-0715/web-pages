function toggleAccordion(contentId, iconId) {
  const content = document.getElementById(contentId);
  const iconBtn = document.getElementById(iconId);
  if (!content || !iconBtn) return;

  const isVisible = content.style.display === 'block' || content.classList.contains('show');
  if (isVisible) {
    content.style.display = 'none';
    content.classList.remove('show');
    iconBtn.style.transform = 'rotate(0deg)';
  } else {
    content.style.display = 'block';
    content.classList.add('show');
    iconBtn.style.transform = 'rotate(180deg)';
  }
}

function toggleYear(contentId, iconId, event) {
  if (event) event.stopPropagation();
  const content = document.getElementById(contentId);
  const iconBtn = document.getElementById(iconId);
  if (!content || !iconBtn) return;

  const isVisible = content.style.display === 'block' || content.classList.contains('show');
  if (isVisible) {
    content.style.display = 'none';
    content.classList.remove('show');
    iconBtn.style.transform = 'rotate(0deg)';
  } else {
    content.style.display = 'block';
    content.classList.add('show');
    iconBtn.style.transform = 'rotate(180deg)';
  }
}