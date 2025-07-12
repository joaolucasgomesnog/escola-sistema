"use client"

import { Box, Button, Modal, Typography } from "@mui/material";
import { useState } from "react";

interface ModalComponentProps {
  open: boolean
  onConfirm: () => void
  handleClose: () => void
}

export default function ModalComponent({onConfirm, open, handleClose}: ModalComponentProps) {


  const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    boxShadow: 24,
    borderRadius: 2,
    p: 4,
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description">
      <Box sx={style}>
        <Typography id="modal-modal-title" variant="h6" component="h2">
          Tem certeza?
        </Typography>
        <Typography id="modal-modal-description" sx={{ mt: 2 }}>
          Esta ação não poderá ser desfeita
        </Typography>
        <Box sx={{ mt: 2 }} display='flex' gap={2}>
          <Button variant="contained" color="primary" onClick={handleClose}>
            Cancelar
          </Button>
          {/* <Button variant="contained" color="error" > */}
          <Button variant="contained" color="error" onClick={onConfirm}>
            Confirmar
          </Button>
        </Box>
      </Box>
    </Modal>
  )
}