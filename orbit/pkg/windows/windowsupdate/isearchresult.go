// based on github.com/kolide/launcher/pkg/osquery/tables
package windowsupdate

import (
	"fmt"

	"github.com/fleetdm/fleet/v4/orbit/pkg/windows/oleconv"
	"github.com/go-ole/go-ole"
	"github.com/go-ole/go-ole/oleutil"
)

// ISearchResult represents the result of a search.
// https://docs.microsoft.com/en-us/windows/win32/api/wuapi/nn-wuapi-isearchresult
type ISearchResult struct {
	disp           *ole.IDispatch
	ResultCode     int32 // enum https://docs.microsoft.com/zh-cn/windows/win32/api/wuapi/ne-wuapi-operationresultcode
	RootCategories []*ICategory
	Updates        []*IUpdate
	Warnings       []*IUpdateException
}

// toISearchResult converts an IDispatch object into an ISearchResult.
func toISearchResult(searchResultDisp *ole.IDispatch) (*ISearchResult, error) {
	var err error
	iSearchResult := &ISearchResult{
		disp: searchResultDisp,
	}

	if iSearchResult.ResultCode, err = oleconv.ToInt32Err(oleutil.GetProperty(searchResultDisp, "ResultCode")); err != nil {
		return nil, fmt.Errorf("ResultCode: %w", err)
	}

	rootCategoriesDisp, err := oleconv.ToIDispatchErr(oleutil.GetProperty(searchResultDisp, "RootCategories"))
	if err != nil {
		return nil, fmt.Errorf("RootCategories: %w", err)
	}
	if rootCategoriesDisp != nil {
		if iSearchResult.RootCategories, err = toICategories(rootCategoriesDisp); err != nil {
			return nil, fmt.Errorf("toICategories: %w", err)
		}
	}

	// Updates is a IUpdateCollection, and we want the full details. So cast it to IUpdate objects
	updatesDisp, err := oleconv.ToIDispatchErr(oleutil.GetProperty(searchResultDisp, "Updates"))
	if err != nil {
		return nil, fmt.Errorf("Updates: %w", err)
	}
	if updatesDisp != nil {
		if iSearchResult.Updates, err = toIUpdates(updatesDisp); err != nil {
			return nil, fmt.Errorf("toIUpdates: %w", err)
		}
	}

	warningsDisp, err := oleconv.ToIDispatchErr(oleutil.GetProperty(searchResultDisp, "Warnings"))
	if err != nil {
		return nil, fmt.Errorf("Warnings: %w", err)
	}
	if warningsDisp != nil {
		if iSearchResult.Warnings, err = toIUpdateExceptions(warningsDisp); err != nil {
			return nil, fmt.Errorf("toIUpdateExceptions: %w", err)
		}
	}

	return iSearchResult, nil
}

// Updates returns the list of updates from the search result.
// This is useful for iterating through the available updates.
func (iSearchResult *ISearchResult) Updates() ([]*IUpdate, error) {
	if iSearchResult.Updates == nil {
		// If the updates were not populated, attempt to fetch them again
		updatesDisp, err := oleconv.ToIDispatchErr(oleutil.GetProperty(iSearchResult.disp, "Updates"))
		if err != nil {
			return nil, fmt.Errorf("failed to get Updates from ISearchResult: %w", err)
		}

		if updatesDisp == nil {
			return nil, fmt.Errorf("no updates were found in the ISearchResult")
		}

		// Convert the dispatch object to an array of IUpdate objects
		iSearchResult.Updates, err = toIUpdates(updatesDisp)
		if err != nil {
			return nil, fmt.Errorf("failed to convert IUpdateCollection to IUpdate objects: %w", err)
		}
	}

	return iSearchResult.Updates, nil
}
