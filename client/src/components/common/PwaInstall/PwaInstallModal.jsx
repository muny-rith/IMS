import React from 'react';
import { Dialog, DialogContent, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import InstallMobileIcon from '@mui/icons-material/InstallMobile';
import ShareIcon from '@mui/icons-material/IosShare';
import AddBoxIcon from '@mui/icons-material/AddBox';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import logo from '../../../assets/images/logo.png';
import './PwaInstallModal.css';

export default function PwaInstallModal({ open, onClose, canInstall, isIOS, triggerInstall }) {
  const handleInstallClick = async () => {
    const success = await triggerInstall();
    if (success) {
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        style: {
          borderRadius: '16px',
          padding: '8px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
        },
      }}
    >
      <div className="pwa-modal-header">
        <IconButton size="small" onClick={onClose} aria-label="close">
          <CloseIcon fontSize="small" />
        </IconButton>
      </div>

      <DialogContent className="pwa-modal-body">
        <div className="pwa-modal-app-card">
          <img src={logo} alt="Moon IMS" className="pwa-modal-app-icon" />
          <div className="pwa-modal-app-meta">
            <h3 className="pwa-modal-app-title">Moon IMS</h3>
            <p className="pwa-modal-app-sub">Enterprise Inventory System</p>
          </div>
        </div>

        <div className="pwa-modal-info">
          <p className="pwa-modal-desc">
            Install Moon IMS on your home screen to use it in <strong>100% Fullscreen</strong> like a native mobile app — without address bar or browser controls.
          </p>

          {canInstall ? (
            <div className="pwa-modal-action-box">
              <button
                type="button"
                className="pwa-modal-install-btn"
                onClick={handleInstallClick}
              >
                <InstallMobileIcon />
                <span>Install Moon IMS Now</span>
              </button>
            </div>
          ) : isIOS ? (
            <div className="pwa-modal-ios-steps">
              <div className="pwa-step-item">
                <div className="pwa-step-num">1</div>
                <div className="pwa-step-content">
                  <span>Tap the <strong>Share</strong> button at bottom of Safari</span>
                  <ShareIcon className="pwa-step-icon" />
                </div>
              </div>

              <div className="pwa-step-item">
                <div className="pwa-step-num">2</div>
                <div className="pwa-step-content">
                  <span>Scroll down and tap <strong>Add to Home Screen</strong></span>
                  <AddBoxIcon className="pwa-step-icon" />
                </div>
              </div>

              <div className="pwa-step-item">
                <div className="pwa-step-num">3</div>
                <div className="pwa-step-content">
                  <span>Tap <strong>Add</strong> in the top-right corner</span>
                  <CheckCircleOutlinedIcon className="pwa-step-icon pwa-step-icon--green" />
                </div>
              </div>
            </div>
          ) : (
            <div className="pwa-modal-generic-steps">
              <p>In your mobile browser (Chrome/Edge/Samsung Internet):</p>
              <ol className="pwa-generic-list">
                <li>Tap the <strong>menu icon (⋮)</strong> in browser toolbar</li>
                <li>Tap <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong></li>
                <li>Open Moon IMS directly from your home screen</li>
              </ol>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
