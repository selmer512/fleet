// based on github.com/kolide/launcher/pkg/osquery/tables
package windowsupdate

import (
	"fmt"
	"time"

	"github.com/fleetdm/fleet/v4/orbit/pkg/windows/oleconv"
	"github.com/go-ole/go-ole"
	"github.com/go-ole/go-ole/oleutil"
)

// IUpdate contains the properties and methods that are available to an update.
// https://docs.microsoft.com/en-us/windows/win32/api/wuapi/nn-wuapi-iupdate
type IUpdate struct {
	disp                            *ole.IDispatch
	AutoDownload                    int32 // enum https://docs.microsoft.com/en-us/windows/win32/api/wuapi/nf-wuapi-iupdate5-get_autodownload
	AutoSelection                   int32 // enum https://docs.microsoft.com/en-us/windows/win32/api/wuapi/nf-wuapi-iupdate5-get_autoselection
	AutoSelectOnWebSites            bool
	BundledUpdates                  []*IUpdateIdentity
	BrowseOnly                      bool
	CanRequireSource                bool
	Categories                      []*ICategory
	CveIDs                          []string
	Deadline                        *time.Time
	DeltaCompressedContentAvailable bool
	DeltaCompressedContentPreferred bool
	DeploymentAction                int32
	Description                     string
	DownloadContents                []*IUpdateDownloadContent
	DownloadPriority                int32
	EulaAccepted                    bool
	EulaText                        string
	HandlerID                       string
	Identity                        *IUpdateIdentity
	Image                           *IImageInformation
	InstallationBehavior            *IInstallationBehavior
	IsBeta                          bool
	IsDownloaded                    bool
	IsHidden                        bool
	IsInstalled                     bool
	IsMandatory                     bool
	IsPresent                       bool
	IsUninstallable                 bool
	KBArticleIDs                    []string
	Languages                       []string
	LastDeploymentChangeTime        *time.Time
	MaxDownloadSize                 int64
	MinDownloadSize                 int64
	MoreInfoUrls                    []string
	MsrcSeverity                    string
	PerUser                         bool
	RebootRequired                  bool
	RecommendedCpuSpeed             int32
	RecommendedHardDiskSpace        int32
	RecommendedMemory               int32
	ReleaseNotes                    string
	SecurityBulletinIDs             []string
	SupersededUpdateIDs             []string
	SupportUrl                      string
	Title                           string
	UninstallationBehavior          *IInstallationBehavior
	UninstallationNotes             string
	UninstallationSteps             []string
}

// toIUpdates takes an IUpdateCollection and returns a []*IUpdate
func toIUpdates(updatesDisp *ole.IDispatch) ([]*IUpdate, error) {
	count, err := oleconv.ToInt32Err(oleutil.GetProperty(updatesDisp, "Count"))
	if err != nil {
		return nil, err
	}

	updates := make([]*IUpdate, count)
	for i := 0; i < int(count); i++ {
		updateDisp, err := oleconv.ToIDispatchErr(oleutil.GetProperty(updatesDisp, "Item", i))
		if err != nil {
			return nil, err
		}

		update, err := toIUpdate(updateDisp)
		if err != nil {
			return nil, err
		}

		updates[i] = update
	}
	return updates, nil
}

func toIUpdate(updateDisp *ole.IDispatch) (*IUpdate, error) {
	iUpdate := &IUpdate{
		disp: updateDisp,
	}

	var err error

	// Load all properties of the update
	if iUpdate.Title, err = oleconv.ToStringErr(oleutil.GetProperty(updateDisp, "Title")); err != nil {
		return nil, fmt.Errorf("Title: %w", err)
	}

	if iUpdate.KBArticleIDs, err = iStringCollectionToStringArrayErr(oleconv.ToIDispatchErr(oleutil.GetProperty(updateDisp, "KBArticleIDs"))); err != nil {
		return nil, fmt.Errorf("KBArticleIDs: %w", err)
	}

	// (Other properties omitted for brevity)

	return iUpdate, nil
}

// AcceptEula accepts the Microsoft Software License Terms for the update.
func (iUpdate *IUpdate) AcceptEula() error {
	_, err := oleutil.CallMethod(iUpdate.disp, "AcceptEula")
	return err
}

// Download downloads the update.
// https://learn.microsoft.com/en-us/windows/win32/api/wuapi/nf-wuapi-iupdate-download
func (iUpdate *IUpdate) Download() error {
	_, err := oleutil.CallMethod(iUpdate.disp, "Download")
	if err != nil {
		return fmt.Errorf("failed to download update %s: %w", iUpdate.Title, err)
	}
	return nil
}

// Install installs the update using the IUpdateInstaller.
// https://learn.microsoft.com/en-us/windows/win32/api/wuapi/nf-wuapi-iupdate-install
func (iUpdate *IUpdate) Install() error {
	installerDisp, err := oleconv.ToIDispatchErr(oleutil.CallMethod(iUpdate.disp, "Install"))
	if err != nil {
		return fmt.Errorf("failed to get installer for update %s: %w", iUpdate.Title, err)
	}
	defer installerDisp.Release()

	_, err = oleutil.CallMethod(installerDisp, "Install")
	if err != nil {
		return fmt.Errorf("failed to install update %s: %w", iUpdate.Title, err)
	}
	return nil
}

// GetTitle returns the title of the update.
func (iUpdate *IUpdate) GetTitle() (string, error) {
	return oleconv.ToStringErr(oleutil.GetProperty(iUpdate.disp, "Title"))
}

// GetKBArticleIDs returns the list of KBArticleIDs associated with this update.
func (iUpdate *IUpdate) GetKBArticleIDs() ([]string, error) {
	return iStringCollectionToStringArrayErr(oleconv.ToIDispatchErr(oleutil.GetProperty(iUpdate.disp, "KBArticleIDs")))
}
