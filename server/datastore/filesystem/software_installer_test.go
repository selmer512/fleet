package filesystem

import (
	"bytes"
	"context"
	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"testing"

	"github.com/fleetdm/fleet/v4/server/fleet"
	"github.com/google/uuid"
	"github.com/stretchr/testify/require"
)

func TestSoftwareInstaller(t *testing.T) {
	ctx := context.Background()

	dir := t.TempDir()
	store, err := NewSoftwareInstallerStore(dir)
	require.NoError(t, err)

	// get a non-existing installer
	blob, length, err := store.Get(ctx, "no-such-installer")
	require.Error(t, err)
	require.True(t, fleet.IsNotFound(err))
	require.Nil(t, blob)
	require.Zero(t, length)

	exists, err := store.Exists(ctx, "no-such-installer")
	require.NoError(t, err)
	require.False(t, exists)

	createInstallerAndHash := func() ([]byte, string) {
		b := make([]byte, 1024)
		_, err = rand.Read(b)
		require.NoError(t, err)

		h := sha256.New()
		_, err = h.Write(b)
		require.NoError(t, err)
		installerID := hex.EncodeToString(h.Sum(nil))

		return b, installerID
	}

	getAndCheck := func(installerID string, expected []byte) {
		rc, sz, err := store.Get(ctx, installerID)
		require.NoError(t, err)
		require.EqualValues(t, len(expected), sz)
		defer rc.Close()

		got, err := io.ReadAll(rc)
		require.NoError(t, err)
		require.Equal(t, expected, got)

		exists, err := store.Exists(ctx, installerID)
		require.NoError(t, err)
		require.True(t, exists)
	}

	// store an installer
	b0, id0 := createInstallerAndHash()
	err = store.Put(ctx, id0, bytes.NewReader(b0))
	require.NoError(t, err)

	// read it back, it should match
	getAndCheck(id0, b0)

	// store another one
	b1, id1 := createInstallerAndHash()
	err = store.Put(ctx, id1, bytes.NewReader(b1))
	require.NoError(t, err)

	// read it back, it should match
	getAndCheck(id1, b1)

	// replace the first one
	err = store.Put(ctx, id0, bytes.NewReader(b0))
	require.NoError(t, err)

	// read it back, it should still match
	getAndCheck(id0, b0)
}

func TestSoftwareInstallerCleanup(t *testing.T) {
	ctx := context.Background()

	dir := t.TempDir()
	store, err := NewSoftwareInstallerStore(dir)
	require.NoError(t, err)

	assertExisting := func(want []string) {
		dirEnts, err := os.ReadDir(filepath.Join(dir, softwareInstallersPrefix))
		require.NoError(t, err)
		got := make([]string, 0, len(dirEnts))
		for _, de := range dirEnts {
			if de.Type().IsRegular() {
				got = append(got, de.Name())
			}
		}
		require.ElementsMatch(t, want, got)
	}

	// cleanup an empty store
	n, err := store.Cleanup(ctx, nil)
	require.NoError(t, err)
	require.Equal(t, 0, n)

	// put an installer
	ins0 := uuid.NewString()
	err = store.Put(ctx, ins0, bytes.NewReader([]byte("installer0")))
	require.NoError(t, err)

	// cleanup but mark it as used
	n, err = store.Cleanup(ctx, []string{ins0})
	require.NoError(t, err)
	require.Equal(t, 0, n)

	assertExisting([]string{ins0})

	// cleanup but mark it as unused
	n, err = store.Cleanup(ctx, []string{})
	require.NoError(t, err)
	require.Equal(t, 1, n)

	assertExisting(nil)

	// put a few installers
	installers := []string{uuid.NewString(), uuid.NewString(), uuid.NewString(), uuid.NewString()}
	for i, ins := range installers {
		err = store.Put(ctx, ins, bytes.NewReader([]byte("installer"+fmt.Sprint(i))))
		require.NoError(t, err)
	}

	n, err = store.Cleanup(ctx, []string{installers[0], installers[2]})
	require.NoError(t, err)
	require.Equal(t, 2, n)

	assertExisting([]string{installers[0], installers[2]})
}
