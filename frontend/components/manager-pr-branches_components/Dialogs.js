import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Alert,
  CircularProgress,
  Typography,
  Chip,
  OutlinedInput,
} from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

export const CreateBranchDialog = ({
  open,
  onClose,
  newBranchName,
  setNewBranchName,
  baseBranchForNew,
  setBaseBranchForNew,
  branches,
  handleCreateBranch,
  creatingBranch,
  createBranchApiError,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
        },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>Create New Branch</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 1 }}>
          <TextField
            autoFocus
            margin="dense"
            label="Branch Name"
            type="text"
            fullWidth
            value={newBranchName}
            onChange={(e) => setNewBranchName(e.target.value)}
            error={createBranchApiError?.data?.message?.includes("name")}
            helperText={
              createBranchApiError?.data?.message?.includes("name")
                ? "Invalid branch name"
                : "Enter a name for the new branch"
            }
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Base Branch</InputLabel>
            <Select
              value={baseBranchForNew}
              label="Base Branch"
              onChange={(e) => setBaseBranchForNew(e.target.value)}
            >
              {branches.map((branch) => (
                <MenuItem key={branch.name} value={branch.name}>
                  {branch.name}
                  {branch.isDefault && " (Default)"}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {createBranchApiError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {createBranchApiError.data?.message || "Failed to create branch"}
            </Alert>
          )}
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button
          onClick={handleCreateBranch}
          variant="contained"
          disabled={!newBranchName || creatingBranch}
        >
          {creatingBranch ? (
            <>
              <CircularProgress size={20} sx={{ mr: 1 }} />
              Creating...
            </>
          ) : (
            "Create Branch"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export const CreatePRDialog = ({
  open,
  onClose,
  prTitle,
  setPrTitle,
  prDescription,
  setPrDescription,
  prBaseBranch,
  setPrBaseBranch,
  prCompareBranch,
  setPrCompareBranch,
  branches,
  selectedReviewers,
  setSelectedReviewers,
  collaborators,
  collaboratorsLoading,
  handleCreatePR,
  creatingPR,
  createPRApiError,
  handleReviewerChange,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
        },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>Create New Pull Request</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 1 }}>
          <TextField
            autoFocus
            margin="dense"
            label="PR Title"
            type="text"
            fullWidth
            value={prTitle}
            onChange={(e) => setPrTitle(e.target.value)}
            error={createPRApiError?.data?.message?.includes("title")}
            helperText={
              createPRApiError?.data?.message?.includes("title")
                ? "Title is required"
                : "Enter a descriptive title for your PR"
            }
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Description"
            multiline
            rows={4}
            fullWidth
            value={prDescription}
            onChange={(e) => setPrDescription(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Base Branch</InputLabel>
              <Select
                value={prBaseBranch}
                label="Base Branch"
                onChange={(e) => setPrBaseBranch(e.target.value)}
              >
                {branches.map((branch) => (
                  <MenuItem key={branch.name} value={branch.name}>
                    {branch.name}
                    {branch.isDefault && " (Default)"}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Compare Branch</InputLabel>
              <Select
                value={prCompareBranch}
                label="Compare Branch"
                onChange={(e) => setPrCompareBranch(e.target.value)}
              >
                {branches.map((branch) => (
                  <MenuItem key={branch.name} value={branch.name}>
                    {branch.name}
                    {branch.isDefault && " (Default)"}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Reviewers</InputLabel>
            <Select
              multiple
              value={selectedReviewers}
              onChange={handleReviewerChange}
              input={<OutlinedInput label="Reviewers" />}
              renderValue={(selected) => (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                  {selected.map((value) => {
                    const reviewer = collaborators.find((c) => c.id === value);
                    return (
                      <Chip
                        key={value}
                        label={reviewer?.name || value}
                        size="small"
                      />
                    );
                  })}
                </Box>
              )}
            >
              {collaborators.map((collaborator) => (
                <MenuItem key={collaborator.id} value={collaborator.id}>
                  {collaborator.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {createPRApiError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {createPRApiError.data?.message || "Failed to create pull request"}
            </Alert>
          )}
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button
          onClick={handleCreatePR}
          variant="contained"
          disabled={
            !prTitle ||
            !prBaseBranch ||
            !prCompareBranch ||
            prBaseBranch === prCompareBranch ||
            creatingPR
          }
        >
          {creatingPR ? (
            <>
              <CircularProgress size={20} sx={{ mr: 1 }} />
              Creating...
            </>
          ) : (
            "Create Pull Request"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export const EditPRDialog = ({
  open,
  onClose,
  prToEdit,
  prTitle,
  setPrTitle,
  prDescription,
  setPrDescription,
  handleUpdatePR,
  updatingPR,
  updatePRApiError,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
        },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>Edit Pull Request</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 1 }}>
          <Alert
            severity="info"
            icon={<InfoOutlinedIcon />}
            sx={{ mb: 2 }}
          >
            <Typography variant="body2">
              You can only edit the title and description of the pull request.
              Other fields cannot be modified after creation.
            </Typography>
          </Alert>
          <TextField
            autoFocus
            margin="dense"
            label="PR Title"
            type="text"
            fullWidth
            value={prTitle}
            onChange={(e) => setPrTitle(e.target.value)}
            error={updatePRApiError?.data?.message?.includes("title")}
            helperText={
              updatePRApiError?.data?.message?.includes("title")
                ? "Title is required"
                : "Enter a descriptive title for your PR"
            }
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Description"
            multiline
            rows={4}
            fullWidth
            value={prDescription}
            onChange={(e) => setPrDescription(e.target.value)}
            sx={{ mb: 2 }}
          />
          {updatePRApiError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {updatePRApiError.data?.message || "Failed to update pull request"}
            </Alert>
          )}
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button
          onClick={handleUpdatePR}
          variant="contained"
          disabled={!prTitle || updatingPR}
        >
          {updatingPR ? (
            <>
              <CircularProgress size={20} sx={{ mr: 1 }} />
              Updating...
            </>
          ) : (
            "Update Pull Request"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}; 